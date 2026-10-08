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
    if (mode === "read-only")
      s.messages.at(-1).parts.unshift({ type: "tool", tool: "read", callID: "call_read", state: { status: "completed", input: { filePath: "/x" }, output: "contents" } });
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
