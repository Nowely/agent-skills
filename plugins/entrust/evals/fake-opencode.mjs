import http from "node:http";
const answer = (result = "checked") => JSON.stringify({ status: "done", result, evidence: ["observed"], artifacts: [], open: [] });
export async function fakeOpenCode(mode = "normal") {
  let seq = 0;
  const sessions = new Map(), calls = [], replies = [], questions = [], mutations = [];
  const state = { mode, sessions, calls, replies, questions, mutations, prompts: 0, aborts: [], url: null };
  const paths = Object.fromEntries([
    ["/session", "post"],
    ["/session/{sessionID}/permissions/{permissionID}", "post"],
    ["/api/session/{sessionID}/message", "get"],
    ["/session/{sessionID}/prompt_async", "post"],
    ["/session/{sessionID}/message", "get"], ["/session/{sessionID}", "get"],
    ["/session/{sessionID}/children", "get"], ["/session/{sessionID}/abort", "post"],
    ["/session/status", "get"], ["/permission", "get"], ["/permission/{requestID}/reply", "post"],
    ["/question", "get"], ["/question/{requestID}/reply", "post"], ["/question/{requestID}/reject", "post"],
  ].map(([p, method]) => [p, { [method]: {} }]));
  if (mode === "missing-route") delete paths["/session/{sessionID}/prompt_async"];
  const foreign = { id: "ses_foreign", directory: "/foreign", messages: [], busy: true, children: [] };
  sessions.set(foreign.id, foreign);
  replies.push({ id: "per_foreign", sessionID: foreign.id, permission: "bash", patterns: ["foreign *"], metadata: { command: "foreign command" } });
  function complete(s, input, valid = true) {
    const info = { id: `msg_answer_${state.prompts}`, parentID: input, sessionID: s.id, role: "assistant",
      providerID: "router", modelID: "deepseek/flash", time: { created: Date.now(), completed: Date.now() }, finish: "stop",
      tokens: { input: 5, output: 3, reasoning: 1, cache: { read: 0, write: 0 } }, cost: 0.01 };
    if (mode === "unknown-model") { delete info.providerID; delete info.modelID; }
    let text = valid ? answer() : "invalid output";
    if (mode === "invalid-correction" || mode === "invalid-correction-busy") text = JSON.stringify({ status: "invalid", result: state.prompts === 1 ? "FIRST" : "SECOND", evidence: [], artifacts: [], open: [] });
    if (mode === "answer-context") text = `Detail before the JSON.\n${answer()}\nDetail after the JSON.`;
    if (mode === "main-proxy-correction") text = JSON.stringify({ plan: "", requests: state.prompts === 1
      ? [{ id: "inspect", action: "collect", agent_ids: ["reviewer"] }] : [], final_answer: "Complete coordinator reply" });
    s.messages.push({ info, parts: [{ type: "text", text }] });
    if (mode === "partial-after-complete") {
      s.messages.push({ info: { ...info, id: `msg_partial_${state.prompts}`, time: { created: Date.now() + 1 } },
        parts: [{ type: "text", text: "Latest partial details" }] });
    }
    if (mode === "old-history" && state.prompts === 1)
      s.messages.at(-1).parts.push({ type: "tool", tool: "bash", callID: "call_old", state: { status: "completed", input: { command: "old command" }, output: "OLD_OUTPUT", metadata: { exit: 0 } } });
    s.busy = false;
  }
  state.complete = complete;
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, "http://localhost"), p = u.pathname;
    let body;
    const chunks = []; for await (const c of req) chunks.push(c);
    try { body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : null; } catch { body = null; }
    calls.push({ method: req.method, path: p, body });
    const json = (value, status = 200) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(value)); };
    if (p === "/global/health" && mode === "health-error") return json({ healthy: false }, 503);
    if (p === "/global/health") return json({ healthy: true, version: "1.18.34" });
    if (p === "/doc") {
      if (mode === "slow-doc") await new Promise((resolve) => setTimeout(resolve, 10000));
      return json({ paths });
    }
    if (p === "/provider") return json({ connected: ["router"], all: [
      { id: "router", models: { "deepseek/flash": { name: "Flash", variants: { high: {} }, capabilities: { toolcall: true } }, "glm/flash": { name: "GLM", variants: {} } } },
      { id: "not-connected", models: { hidden: { name: "Hidden", variants: {}, capabilities: {} } } },
    ] });
    if (p === "/event") { res.writeHead(200, { "Content-Type": "text/event-stream" }); res.write('data: {"type":"server.connected"}\n\n'); return; }
    if (p === "/session" && req.method === "POST") {
      const s = { id: `ses_owned_${++seq}`, directory: u.searchParams.get("directory"), permission: body.permission, messages: [], busy: false, children: [], time: { created: Date.now() } };
      sessions.set(s.id, s); return json({ id: s.id, directory: s.directory, permission: s.permission, time: s.time });
    }
    if (p === "/session/status") {
      if (mode === "status-error") return json({ error: "status unavailable" }, 503);
      if (mode === "cancel-final-snapshot" && state.prompts > 0 && (state.statusReads = (state.statusReads ?? 0) + 1) === 2) {
        state.finalSnapshot = true; await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return json(Object.fromEntries([...sessions.values()].filter((s) => s.busy).map((s) => [s.id, { type: "busy" }])));
    }
    if (p === "/permission") {
      // The second read after the prompt, once the partial reply has been fetched, fails.
      if (mode === "transport-after-partial" && state.prompts > 0 && (state.permissionReads = (state.permissionReads ?? 0) + 1) >= 2)
        return json({ error: "permissions unavailable" }, 503);
      const own = replies.find((q) => q.sessionID !== foreign.id);
      if (mode === "cancel-request-read" && own && ++state.permissionReads === 3) {
        own.metadata.command = "changed request"; state.requestReadInFlight = true;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return json(replies);
    }
    if (p === "/question") return json(questions);
    const permission = /^\/permission\/([^/]+)\/reply$/.exec(p);
    const question = /^\/question\/([^/]+)\/(reply|reject)$/.exec(p);
    if (permission || question) {
      const list = permission ? replies : questions, id = (permission ?? question)[1];
      const i = list.findIndex((q) => q.id === id);
      if (i === -1) return json({ error: "unknown request" }, 404);
      const q = list[i]; mutations.push({ id, body, sessionID: q.sessionID }); list.splice(i, 1);
      if (permission && !["once", "reject"].includes(body?.reply)) return json({ error: "reply required" }, 400);
      if (permission && body.reply === "reject")
        for (let n = list.length - 1; n >= 0; n--) if (list[n].sessionID === q.sessionID) list.splice(n, 1);
      const s = sessions.get(q.sessionID);
      if (s.aborted) {
        for (const m of s.messages) for (const part of m.parts ?? [])
          if (part.type === "tool" && part.state.status === "running") part.state.status = "error";
      } else complete(s, s.input);
      if (mode === "permission-group-lost") { res.destroy(); return; }
      return json(true);
    }
    const m = /^\/session\/([^/]+)(?:\/(.*))?$/.exec(p);
    if (!m || !sessions.has(m[1])) return json({ error: "not found" }, 404);
    const s = sessions.get(m[1]), route = m[2];
    if (!route) return json({ id: s.id, directory: s.directory, permission: s.permission, time: s.time });
    if (route === "children") {
      if (mode === "child-scan-error") return json({ error: "children unavailable" }, 503);
      if (mode === "cancel-child-scan" && s.id !== "ses_child" && state.prompts > 0 && ++state.childScans > 1) {
        state.scanFailed = true; return json({ error: "children unavailable" }, 503);
      }
      return json(s.children);
    }
    if (route === "message") return json(s.messages);
    if (route === "abort") {
      state.aborts.push(s.id); s.busy = false; s.aborted = true;
      if (mode === "cancel-foreign-same") replies.push({ id: "per_unowned_same", sessionID: s.id, permission: "bash", patterns: ["foreign *"], metadata: { command: "another invocation" } });
      if (!["cancel-question", "cancel-foreign-same", "cancel-unknown-tool"].includes(mode))
        for (const m of s.messages) for (const part of m.parts ?? [])
          if (part.type === "tool" && part.state.status === "running") part.state.status = "error";
      return json(true);
    }
    if (route !== "prompt_async" || req.method !== "POST") return json({ error: "wrong execution family" }, 400);
    if (mode === "cancel-before-admission") {
      state.promptInFlight = true;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    state.prompts++; s.input = body.messageID; s.busy = true;
    s.messages.push({ info: { id: body.messageID, role: "user", sessionID: s.id, time: { created: Date.now() } }, parts: body.parts });
    if (["permission", "question", "cancel-question", "cancel-foreign-same", "cancel-request-read", "cancel-permission-group", "permission-group", "permission-group-lost"].includes(mode)) {
      if (["permission", "cancel-foreign-same", "cancel-request-read", "cancel-permission-group", "permission-group", "permission-group-lost"].includes(mode)) replies.push({ id: `per_native_${state.prompts}`, sessionID: s.id, permission: "bash", patterns: ["node *"], metadata: { command: "node check.mjs" } });
      else questions.push({ id: `que_native_${state.prompts}`, sessionID: s.id, questions: [{ header: "Mode", question: "Choose", options: [{ label: "Read" }], custom: false }] });
      if (["cancel-permission-group", "permission-group", "permission-group-lost"].includes(mode)) replies.push({ id: "per_second_owned", sessionID: s.id, permission: "bash", patterns: ["node *"], metadata: { command: "node second.mjs" } });
      if (mode === "cancel-question") s.messages.push({ info: { id: "msg_waiting_question", parentID: body.messageID, role: "assistant", sessionID: s.id },
        parts: [{ type: "tool", tool: "question", callID: "call_question", state: { status: "running", input: {} } }] });
    } else if (mode === "intermediate") {
      complete(s, body.messageID); s.messages.at(-1).parts[0].text = answer("intermediate"); s.busy = true;
      setTimeout(() => complete(s, body.messageID), 3500);
    } else if (["cancel", "cancel-unknown-tool", "cancel-before-admission", "cancel-child-scan", "transport-after-partial"].includes(mode)) {
      if (mode === "cancel-child-scan") {
        state.childScans = 0; s.children = [{ id: "ses_child" }];
        sessions.set("ses_child", { id: "ses_child", messages: [], busy: true, children: [] });
      }
      s.messages.push({ info: { id: "msg_partial", parentID: body.messageID, role: "assistant", sessionID: s.id, providerID: "router", modelID: "deepseek/flash" },
        parts: [{ type: "text", text: "partial work" }, { type: "tool", tool: "bash", callID: "call_running", state: { status: "running", input: { command: "long work" } } }] });
    } else {
      complete(s, body.messageID, mode !== "correction" || state.prompts > 1);
      if (mode === "invalid-correction-busy" && state.prompts > 1) s.busy = true;
      if (mode === "partial-after-complete") s.busy = true;
    }
    if (mode === "lost-response") { req.socket.destroy(); return; }
    res.writeHead(204); res.end();
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  state.url = `http://127.0.0.1:${server.address().port}`;
  state.close = async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); };
  return state;
}

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
