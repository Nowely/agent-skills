// The V2 stand-in for an OpenCode server, retired from evals/fake-opencode.mjs on 2026-10-08 with the V2 path
// (decision 4 of research/2026-10-08-driver-audit). A record: it used that file's imports and helpers.

export async function fakeOpenCodeV2(mode = "normal") {
  const sessions = new Map(), calls = [], permissions = [], questions = [], mutations = [];
  const state = { sessions, calls, replies: permissions, questions, mutations, prompts: 0, aborts: [] };
  const paths = Object.fromEntries([
    ["/api/session", ["get", "post"]], ["/api/model", ["get"]], ["/api/agent", ["get"]],
    ["/session/{sessionID}/prompt_async", ["post"]],
    ["/api/session/active", ["get"]], ["/api/session/{sessionID}", ["get"]],
    ["/api/session/{sessionID}/prompt", ["post"]], ["/api/session/{sessionID}/message", ["get"]],
    ["/api/session/{sessionID}/history", ["get"]], ["/api/session/{sessionID}/interrupt", ["post"]],
    ["/api/session/{sessionID}/model", ["post"]], ["/api/permission/request", ["get"]], ["/api/question/request", ["get"]],
    ["/api/session/{sessionID}/permission", ["get"]], ["/api/session/{sessionID}/question", ["get"]],
    ["/api/session/{sessionID}/permission/{requestID}/reply", ["post"]],
    ["/api/session/{sessionID}/question/{requestID}/reply", ["post"]],
    ["/api/session/{sessionID}/question/{requestID}/reject", ["post"]],
  ].map(([p, methods]) => [p, Object.fromEntries(methods.map((m) => [m, {}]))]));
  const event = (s, type, fields) => s.history.push({ type, durable: { aggregateID: s.id, seq: s.history.length + 1, version: 1 },
    data: { sessionID: s.id, timestamp: Date.now(), ...fields } });
  const info = (s) => ({ id: s.id, parentID: s.parentID, title: s.title, agent: s.agent, model: s.model, location: { directory: s.directory } });
  const make = (id, directory, parentID = null) => ({ id, directory, parentID, agent: "bridge", model: { providerID: "router", id: "deepseek/flash", variant: "high" }, messages: [], history: [], busy: false });
  const foreign = make("ses_foreign", "/foreign"); sessions.set(foreign.id, foreign);
  permissions.push({ id: "per_foreign", sessionID: foreign.id, action: "bash", resources: ["foreign command"] });
  function start(s, input, content) {
    const id = `msg_step_${s.id}_${s.history.length}`;
    event(s, "session.next.step.started", { assistantMessageID: id, model: s.model, agent: s.agent });
    const m = { id, type: "assistant", agent: s.agent, model: s.model, time: { created: Date.now() }, content };
    s.messages.push(m); return m;
  }
  function complete(s) {
    for (const m of s.messages) {
      for (const p of m.content ?? []) if (p.type === "tool" && p.state.status === "running") {
        p.state.status = "completed"; p.state.structured = { exit: 0 }; p.state.content = [{ type: "text", text: "NATIVE_TOOL_OK" }];
      }
      if (m.type === "assistant") m.time.completed ??= Date.now();
    }
    const m = start(s, s.input, [{ type: "text", text: answer() }]);
    Object.assign(m, { finish: "stop", cost: 0, tokens: { input: 5, output: 3, reasoning: 1, cache: { read: 0, write: 0 } } });
    m.time.completed = Date.now(); s.busy = false;
  }
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, "http://local"), p = u.pathname;
    const chunks = []; for await (const c of req) chunks.push(c);
    const body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : null;
    calls.push({ method: req.method, path: p, query: Object.fromEntries(u.searchParams), body });
    const json = (r, status = 200) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(r)); };
    const done = () => { res.writeHead(204); res.end(); };
    const page = (rows) => {
      if (!(Number(u.searchParams.get("limit")) > 0 && Number(u.searchParams.get("limit")) <= 200))
        return json({ error: "page limit must be 1..200" }, 400);
      if (u.searchParams.has("cursor") && u.searchParams.has("order")) return json({ error: "cursor with order" }, 400);
      const n = Number(u.searchParams.get("cursor") ?? "0"), data = rows.slice(n, n + 2);
      return json({ data, cursor: data.length ? { next: String(n + data.length) } : {} });
    };
    if (p === "/global/health") return json({ healthy: true, version: "1.18.34" });
    if (p === "/doc") return json({ paths });
    if (p === "/provider") return json({ connected: ["router"], all: [{ id: "router", models: {
      "deepseek/flash": { name: "Flash V1", variants: { high: {} }, capabilities: { toolcall: true } },
    } }] });
    if (p === "/api/model" && mode === "v2-model-error") return json({ error: "catalog unavailable" }, 503);
    if (p === "/api/model") return json({ data: [
      { id: "deepseek/flash", providerID: "router", enabled: true,
        api: { package: mode === "unsupported-sdk" ? "@openrouter/ai-sdk-provider" : "@ai-sdk/openai-compatible" }, variants: [{ id: "high" }], name: "Flash", capabilities: { toolcall: true } },
      { id: "glm", providerID: "router", enabled: true, api: { package: "@openrouter/ai-sdk-provider" }, variants: [], name: "GLM" },
      { id: "disabled", providerID: "router", enabled: false, api: { package: "@ai-sdk/openai-compatible" }, variants: [], name: "Disabled" },
    ] });
    if (p === "/api/agent") return json({ data: [{ id: "default", mode: "primary", permissions: [
      { action: "*", resource: "*", effect: "allow" },
    ] }, { id: "bridge", mode: "primary", permissions: [
      { action: "*", resource: "*", effect: "deny" }, { action: "bash", resource: "*", effect: mode === "broad-profile" ? "allow" : "ask" },
      { action: "question", resource: "*", effect: "allow" },
    ] }] });
    if (p === "/api/event") { res.writeHead(200, { "Content-Type": "text/event-stream" }); res.write('data: {"type":"server.connected"}\n\n'); return; }
    const localRequests = (rows) => rows.filter((q) => sessions.get(q.sessionID)?.directory === u.searchParams.get("location[directory]"));
    if (p === "/api/permission/request") return json({ data: localRequests(permissions) });
    if (p === "/api/question/request") return json({ data: localRequests(questions) });
    if (p === "/api/session/active") return json({ data: mode === "malformed-active" ? null
      : Object.fromEntries([...sessions.values()].filter((s) => s.busy).map((s) => [s.id, { type: "running" }])) });
    if (p === "/api/session" && req.method === "GET")
      return page([...sessions.values()].filter((s) => !u.searchParams.has("directory") || s.directory === u.searchParams.get("directory")).map(info));
    if (p === "/api/session" && req.method === "POST") {
      if (Object.keys(body).some((key) => !["id", "agent", "model", "location"].includes(key)))
        return json({ error: "undeclared session-create field" }, 400);
      const s = make(`ses_owned_${sessions.size}`, body.location.directory); Object.assign(s, { agent: body.agent, model: body.model });
      if (mode === "changed-created-model") s.model = { ...s.model, id: "other-model" };
      sessions.set(s.id, s); return json({ data: info(s) });
    }
    const route = /^\/api\/session\/([^/]+)(?:\/(.*))?$/.exec(p);
    const s = route && sessions.get(route[1]);
    if (!s) return json({ error: "not found" }, 404);
    const action = route[2];
    if (!action) return json({ data: info(s) });
    if (action === "permission") return json({ data: permissions.filter((q) => q.sessionID === s.id) });
    if (action === "question") return json({ data: questions.filter((q) => q.sessionID === s.id) });
    if (action === "message") return page(s.messages);
    if (action === "history") {
      if (!(Number(u.searchParams.get("limit")) > 0 && Number(u.searchParams.get("limit")) <= 100))
        return json({ error: "history limit must be 1..100" }, 400);
      const rows = s.history.filter((e) => e.durable.seq > Number(u.searchParams.get("after") ?? 0));
      return json({ data: rows.slice(0, 2), hasMore: rows.length > 2 });
    }
    if (action === "model") { s.model = body.model; return done(); }
    if (action === "interrupt") {
      state.aborts.push(s.id); s.busy = false;
      for (const m of s.messages) for (const p of m.content ?? []) if (p.type === "tool" && p.state.status === "running") p.state.status = "error";
      return done();
    }
    const callback = /^(permission|question)\/([^/]+)\/(reply|reject)$/.exec(action ?? "");
    if (callback) {
      const list = callback[1] === "permission" ? permissions : questions;
      const q = list.find((q) => q.id === callback[2] && q.sessionID === s.id);
      if (!q) return json({ error: "request belongs to another session" }, 404);
      mutations.push({ id: q.id, sessionID: s.id, body });
      list.splice(list.indexOf(q), 1);
      if (callback[1] === "permission" && body.reply === "reject")
        for (let i = list.length - 1; i >= 0; i--) if (list[i].sessionID === s.id) list.splice(i, 1);
      if (mode !== "cancel-question") complete(s);
      if (s.parentID) complete(sessions.get(s.parentID));
      return mode === "unexpected-reply-status" ? json(true) : done();
    }
    if (action !== "prompt" || req.method !== "POST") return json({ error: "wrong native operation" }, 400);
    state.prompts++; s.input = body.id; s.busy = true;
    event(s, "session.next.prompt.admitted", { messageID: body.id, prompt: body.prompt, delivery: body.delivery });
    event(s, "session.next.prompted", { messageID: body.id, prompt: body.prompt, delivery: body.delivery });
    s.messages.push({ id: body.id, type: "user", text: body.prompt.text, time: { created: Date.now() } });
    if (["permission", "child-permission", "child-other-dir", "question", "cancel-question", "unexpected-reply-status"].includes(mode)) {
      const qtype = ["question", "cancel-question"].includes(mode) ? "question" : "permission";
      let target = s;
      if (["child-permission", "child-other-dir"].includes(mode)) {
        target = make("ses_child", mode === "child-other-dir" ? "/child-directory" : s.directory, s.id); target.busy = true; target.input = "msg_child";
        event(target, "session.next.prompted", { messageID: target.input }); sessions.set(target.id, target);
      }
      const m = start(target, target.input, [{ type: "tool", name: qtype === "permission" ? "bash" : "question", id: "call_native",
        state: { status: "running", input: { command: "printf native" }, structured: {}, content: [] } }]);
      const q = { id: qtype === "permission" ? "per_native" : "que_native", sessionID: target.id,
        ...(qtype === "permission" ? { action: "bash", resources: ["printf native"], source: { type: "tool", messageID: m.id, callID: "call_native" } }
          : { questions: [{ header: "Mode", question: "Choose", options: [{ label: "Read" }], custom: false }], tool: { messageID: m.id, callID: "call_native" } }) };
      (qtype === "permission" ? permissions : questions).push(q);
    } else complete(s);
    if (mode === "lost-response") { res.destroy(); return; }
    if (mode === "server-error-after-admission") return json({ error: "runner scheduling failed after admission" }, 503);
    return json({ data: { id: body.id, sessionID: s.id, prompt: body.prompt, delivery: body.delivery } });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  state.url = `http://127.0.0.1:${server.address().port}`;
  state.close = async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); };
  return state;
}
