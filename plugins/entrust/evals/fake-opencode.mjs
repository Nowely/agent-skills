import fs from "node:fs";
import http from "node:http";
import path from "node:path";
const answer = (result = "checked") => JSON.stringify({ status: "done", result, evidence: ["observed"], artifacts: [], open: [] });
// The V2 stand-in for an OpenCode server: the routes, envelopes and acknowledgement statuses the
// adapter speaks. List results arrive wrapped in `data`; replies acknowledge with 204 and no body.
export async function fakeOpenCode(mode = "normal") {
  let seq = 0;
  const sessions = new Map(), calls = [], replies = [], questions = [], mutations = [];
  // `defaultModel` is the configuration's `model`, which MODEL: inherit selects; none is set unless a case sets it.
  const state = { mode, sessions, calls, replies, questions, mutations, prompts: 0, aborts: [], url: null, defaultModel: null };
  const paths = Object.fromEntries([
    ["/api/session", { get: {}, post: {} }],
    ["/api/session/active", { get: {} }],
    ["/api/session/{sessionID}", { get: {} }],
    ["/api/session/{sessionID}/prompt", { post: {} }],
    ["/api/session/{sessionID}/message", { get: {} }],
    ["/api/session/{sessionID}/interrupt", { post: {} }],
    ["/api/session/{sessionID}/model", { post: {} }],
    ["/api/session/{sessionID}/permission", { get: {} }],
    ["/api/session/{sessionID}/permission/{requestID}/reply", { post: {} }],
    ["/api/session/{sessionID}/form", { get: {} }],
    ["/api/session/{sessionID}/form/{formID}/reply", { post: {} }],
    ["/api/session/{sessionID}/form/{formID}", { delete: {} }],
  ].map(([p, m]) => [p, m]));
  if (mode === "missing-route") delete paths["/api/session/{sessionID}/prompt"];
  const MODEL = { id: "deepseek/flash", providerID: "router", variant: "high" };
  const foreign = { id: "ses_foreign", parentID: null, directory: "/foreign", model: { ...MODEL }, permissions: [], messages: [], busy: true, time: { created: Date.now() } };
  sessions.set(foreign.id, foreign);
  replies.push({ id: "per_foreign", sessionID: foreign.id, action: "bash", resources: ["foreign command"], metadata: { command: "foreign command" } });
  const validAnswer = (f, v) => {
    const option = (x) => !f.options || f.custom || f.options.some((o) => o.value === x);
    if (f.type === "boolean") return typeof v === "boolean";
    if (f.type === "number" || f.type === "integer") return typeof v === "number" && (f.type === "number" || Number.isInteger(v));
    if (f.type === "multiselect") return Array.isArray(v) && v.every((x) => typeof x === "string" && option(x));
    return typeof v === "string" && option(v);
  };
  const infoOf = (s) => ({ id: s.id, parentID: s.parentID, model: s.model, permissions: s.permissions, location: { directory: s.directory }, time: s.time });
  function complete(s, input, valid = true) {
    let text = valid ? answer(state.results?.[state.prompts - 1]) : "invalid output";
    if (mode === "invalid-correction" || mode === "invalid-correction-busy") text = JSON.stringify({ status: "invalid", result: state.prompts === 1 ? "FIRST" : "SECOND", evidence: [], artifacts: [], open: [] });
    if (mode === "answer-context") text = `Detail before the JSON.\n${answer()}\nDetail after the JSON.`;
    if (mode === "oneof-correction") text = JSON.stringify({ plan: "", requests: state.prompts === 1
      ? [{ id: "inspect", action: "collect", agent_ids: ["reviewer"] }] : [], final_answer: "Complete coordinator reply" });
    const m = { id: `msg_answer_${state.prompts}`, type: "assistant", agent: "build", model: { ...s.model },
      time: { created: Date.now(), completed: Date.now() }, finish: "stop",
      tokens: { input: 5, output: 3, reasoning: 1, cache: { read: 0, write: 0 } }, cost: 0.01,
      content: [{ type: "text", text }] };
    if (mode === "unknown-model") { m.model = {}; }
    s.messages.push(m);
    if (mode === "partial-after-complete") {
      s.messages.push({ ...m, id: `msg_partial_${state.prompts}`, time: { created: Date.now() + 1 },
        content: [{ type: "text", text: "Latest partial details" }] });
    }
    if (mode === "read-only")
      s.messages.at(-1).content.unshift({ type: "tool", id: "call_read", name: "read",
        state: { status: "completed", input: { path: "/x" }, content: [{ type: "text", text: "contents" }], metadata: {} }, time: { created: Date.now() } });
    if (mode === "old-history" && state.prompts === 1)
      s.messages.at(-1).content.push({ type: "tool", id: "call_old", name: "shell",
        state: { status: "completed", input: { command: "old command" }, content: [{ type: "text", text: "OLD_OUTPUT" }], metadata: { exit: 0 } }, time: { created: Date.now() } });
    s.busy = false;
  }
  state.complete = complete;
  const server = http.createServer(async (req, res) => {
    const u = new URL(req.url, "http://localhost"), p = u.pathname;
    let body;
    const chunks = []; for await (const c of req) chunks.push(c);
    try { body = chunks.length ? JSON.parse(Buffer.concat(chunks)) : null; } catch { body = null; }
    calls.push({ method: req.method, path: p, query: u.search, body });
    const json = (value, status = 200) => { res.writeHead(status, { "Content-Type": "application/json" }); res.end(JSON.stringify(value)); };
    const done = () => { res.writeHead(204); res.end(); };
    if (p === "/api/info") return json({ version: "2.1.2", pid: process.pid, urls: [state.url], paths: { tmp: "/tmp" } });
    if (p === "/openapi.json") {
      if (mode === "slow-doc") await new Promise((resolve) => setTimeout(resolve, 10000));
      return json({ paths });
    }
    // The catalogue names a model by `id`; an alias such as `glm/flash-fast` shares its provider's modelID.
    const catalogue = [
      { id: "deepseek/flash", modelID: "deepseek/flash", providerID: "router", enabled: true, status: "active", name: "Flash", variants: [{ id: "high" }] },
      { id: "glm/flash", modelID: "glm/flash", providerID: "router", enabled: true, status: "active", name: "GLM", variants: [] },
      { id: "glm/flash-fast", modelID: "glm/flash", providerID: "router", enabled: true, status: "active", name: "GLM fast", variants: [] },
    ];
    if (p === "/api/model" && mode === "slow-catalogue") await new Promise((resolve) => setTimeout(resolve, 1500));
    if (p === "/api/model") return json({ location: { directory: u.searchParams.get("location[directory]") ?? "/fake" }, data: catalogue });
    if (p === "/api/config") return json([{ type: "document", path: "/fake/opencode.json", info: state.defaultModel ? { model: state.defaultModel } : {} }]);
    if (p === "/api/model/default") {
      const [providerID, ...rest] = (state.defaultModel ?? "router/glm/flash").split("/");
      return json({ location: { directory: "/fake" }, data: catalogue.find((m) => m.providerID === providerID && m.id === rest.join("/")) ?? null });
    }
    if (p === "/api/session" && req.method === "POST") {
      // `rules-dropped` keeps none of the rules it was sent, `rules-widened` allows every edit, as a server
      // that did not apply them would report; `rules-silent` reports none at all.
      const permissions = mode === "rules-dropped" ? [] : mode === "rules-widened" ? [...(body.permissions ?? []), { action: "edit", resource: "*", effect: "allow" }]
        : mode === "rules-silent" ? undefined : body.permissions;
      const s = { id: `ses_owned_${++seq}`, parentID: null, directory: body.location?.directory, model: body.model ?? { ...MODEL },
        permissions, messages: [], busy: false, time: { created: Date.now() } };
      sessions.set(s.id, s); return json({ data: infoOf(s) });
    }
    if (p === "/api/session" && req.method === "GET") {
      if (mode === "child-scan-error") return json({ error: "children unavailable" }, 503);
      if (mode === "cancel-child-scan" && state.prompts > 0 && !u.searchParams.has("cursor") && (state.childScans = (state.childScans ?? 0) + 1) > 1) {
        state.scanFailed = true; return json({ error: "children unavailable" }, 503);
      }
      // Fifty to a page by default, `next` set until a page comes back empty, as on the live server.
      const parent = u.searchParams.get("parentID"), limit = Number(u.searchParams.get("limit") ?? 50), from = Number(u.searchParams.get("cursor") ?? 0);
      const data = [...sessions.values()].filter((s) => s.parentID === parent).slice(from, from + limit).map(infoOf);
      return json({ data, cursor: { previous: null, next: data.length ? String(from + data.length) : null } });
    }
    if (p === "/api/session/active") {
      if (mode === "status-error") return json({ error: "status unavailable" }, 503);
      if (mode === "cancel-final-snapshot" && state.prompts > 0 && (state.statusReads = (state.statusReads ?? 0) + 1) === 2) {
        state.finalSnapshot = true; await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return json({ data: Object.fromEntries([...sessions.values()].filter((s) => s.busy).map((s) => [s.id, { type: "running" }])) });
    }
    const route = /^\/api\/session\/([^/]+)(?:\/(.*))?$/.exec(p);
    const s = route && sessions.get(route[1]);
    if (!s) return json({ error: "not found" }, 404);
    const action = route[2];
    if (!action) return json({ data: infoOf(s) });
    if (action === "permission") {
      if (state.listDelayMs) await new Promise((resolve) => setTimeout(resolve, state.listDelayMs));
      // The second read after the prompt, once the partial reply has been fetched, fails.
      if (mode === "transport-after-partial" && state.prompts > 0 && (state.permissionReads = (state.permissionReads ?? 0) + 1) >= 2)
        return json({ error: "permissions unavailable" }, 503);
      const own = replies.find((q) => q.sessionID !== foreign.id);
      if (mode === "cancel-request-read" && own && ++state.permissionReads === 3) {
        own.metadata.command = "changed request"; own.resources = ["changed request"]; state.requestReadInFlight = true;
        await new Promise((resolve) => setTimeout(resolve, 200));
      }
      return json({ data: replies.filter((q) => q.sessionID === s.id) });
    }
    if (action === "form") return json({ data: questions.filter((q) => q.sessionID === s.id) });
    if (action === "message") {
      const limit = Number(u.searchParams.get("limit"));
      if (!(limit > 0 && limit <= 200)) return json({ error: "page limit must be 1..200" }, 400);
      // Newest first unless the first page asks for asc; the cursor carries the order, and `next` stays set
      // until a page comes back empty, as on the live server.
      const [order, from] = u.searchParams.has("cursor") ? u.searchParams.get("cursor").split(":") : [u.searchParams.get("order") ?? "desc", "0"];
      const all = order === "asc" ? s.messages : [...s.messages].reverse();
      const data = all.slice(Number(from), Number(from) + limit);
      return json({ data, cursor: { previous: null, next: data.length ? `${order}:${Number(from) + data.length}` : null } });
    }
    if (action === "model") { s.model = body.model; return done(); }
    if (action === "interrupt") {
      const running = s.busy;
      state.aborts.push(s.id); s.busy = false; s.aborted = true;
      if (mode === "cancel-foreign-same") replies.push({ id: "per_unowned_same", sessionID: s.id, action: "bash", resources: ["another invocation"], metadata: { command: "another invocation" } });
      if (!["cancel-question", "cancel-foreign-same", "cancel-unknown-tool"].includes(mode))
        for (const m of s.messages) for (const part of m.content ?? [])
          if (part.type === "tool" && part.state.status === "running") part.state.status = "error";
      return json({ interrupted: running });
    }
    const permissionReply = /^permission\/([^/]+)\/reply$/.exec(action);
    const formReply = /^form\/([^/]+)\/reply$/.exec(action);
    const formCancel = /^form\/([^/]+)$/.exec(action);
    const errorRunning = (s) => { for (const m of s.messages) for (const part of m.content ?? [])
      if (part.type === "tool" && part.state.status === "running") part.state.status = "error"; };
    if (req.method === "DELETE" && formCancel) {
      const i = questions.findIndex((q) => q.id === formCancel[1] && q.sessionID === s.id);
      if (i === -1) return json({ error: "unknown request" }, 404);
      mutations.push({ id: formCancel[1], body: null, message: u.searchParams.get("message"), sessionID: s.id });
      questions.splice(i, 1);
      if (s.aborted) errorRunning(s);
      else if (mode !== "cancel-question") complete(s, s.input);
      return done();
    }
    if (permissionReply || formReply) {
      const list = permissionReply ? replies : questions, id = (permissionReply ?? formReply)[1];
      const i = list.findIndex((q) => q.id === id && q.sessionID === s.id);
      if (i === -1) return json({ error: "unknown request" }, 404);
      const q = list[i];
      // As the live server: a value of another type than its field's, or an option's label for its value, is
      // refused and the form stays pending.
      if (formReply && !q.fields.every((f) => validAnswer(f, body?.answer?.[f.key])))
        return json({ _tag: "FormInvalidAnswerError", id, message: "invalid answer" }, 400);
      mutations.push({ id, body, sessionID: q.sessionID }); list.splice(i, 1);
      if (permissionReply && !["once", "always", "reject"].includes(body?.decision)) return json({ error: "decision required" }, 400);
      if (permissionReply && body.decision === "reject")
        for (let n = list.length - 1; n >= 0; n--) if (list[n].sessionID === q.sessionID) list.splice(n, 1);
      if (["child-permission", "many-children"].includes(mode)) state.childDone();
      else if (["permission-slow", "question-slow"].includes(mode)) setTimeout(() => complete(s, s.input), state.slowMs ?? 1200);
      else if (s.aborted) errorRunning(s);
      else complete(s, s.input);
      if (mode === "permission-group-lost") { res.destroy(); return; }
      if (state.replyDelayMs) await new Promise((resolve) => setTimeout(resolve, state.replyDelayMs));
      return done();
    }
    if (action !== "prompt" || req.method !== "POST") return json({ error: "wrong execution family" }, 400);
    if (mode === "cancel-before-admission") {
      state.promptInFlight = true;
      await new Promise((resolve) => setTimeout(resolve, 400));
    }
    state.prompts++; s.input = body.id; s.busy = true;
    s.messages.push({ id: body.id, type: "user", text: body.text, time: { created: Date.now() } });
    if (mode === "edit-outside") {
      // An edit the session rules ask about: `state.editTarget`, which the case sets, outside the run's roots.
      replies.push({ id: `per_edit_${state.prompts}`, sessionID: s.id, action: "edit", resources: [state.editTarget], metadata: { filePath: state.editTarget } });
    } else if (["permission", "permission-slow", "question", "question-slow", "cancel-question", "cancel-foreign-same", "cancel-request-read", "cancel-permission-group", "permission-group", "permission-group-lost"].includes(mode)) {
      if (["permission", "permission-slow", "cancel-foreign-same", "cancel-request-read", "cancel-permission-group", "permission-group", "permission-group-lost"].includes(mode)) replies.push({ id: `per_native_${state.prompts}`, sessionID: s.id, action: "bash", resources: ["node *"], metadata: { command: "node check.mjs" } });
      else questions.push({ id: `que_native_${state.prompts}`, sessionID: s.id, title: "Choose", fields: [{ key: "q", type: "string", options: [{ value: "read", label: "Read" }] }] });
      if (["cancel-permission-group", "permission-group", "permission-group-lost"].includes(mode)) replies.push({ id: "per_second_owned", sessionID: s.id, action: "bash", resources: ["node *"], metadata: { command: "node second.mjs" } });
      if (mode === "cancel-question") s.messages.push({ id: `msg_waiting_question_${state.prompts}`, type: "assistant", agent: "build", model: { ...s.model }, time: { created: Date.now() },
        content: [{ type: "tool", id: "call_question", name: "question", state: { status: "running", input: {}, metadata: {} }, time: { created: Date.now() } }] });
    } else if (mode === "slow") {
      // Busy work that ends by itself after state.slowMs; the server reports it busy throughout.
      setTimeout(() => complete(s, body.id), state.slowMs ?? 3500);
    } else if (mode === "question-typed") {
      questions.push({ id: `que_typed_${state.prompts}`, sessionID: s.id, title: "Settings", fields: [
        { key: "on", type: "boolean", title: "On" }, { key: "count", type: "integer", title: "Count" },
        { key: "tags", type: "multiselect", title: "Tags", options: [{ value: "x", label: "Ex" }, { value: "y", label: "Why" }] },
        { key: "mode", type: "string", title: "Mode", options: [{ value: "read", label: "Read mode" }] }] });
    } else if (mode === "many-children") {
      // Fifty-one subagents, the last of which asks: it is on the second page of the parent's children.
      for (let n = 1; n <= 51; n++) sessions.set(`ses_kid_${n}`, { id: `ses_kid_${n}`, parentID: s.id, directory: s.directory, model: { ...MODEL }, permissions: [], messages: [], busy: n === 51, time: { created: Date.now() } });
      replies.push({ id: "per_kid_51", sessionID: "ses_kid_51", action: "bash", resources: ["node *"], metadata: { command: "node kid.mjs" } });
      state.childDone = () => { sessions.get("ses_kid_51").busy = false; complete(s, body.id); };
    } else if (mode === "child-permission") {
      // A subagent's session asks; its parent's list never shows the request.
      const child = { id: `ses_child_${state.prompts}`, parentID: s.id, directory: s.directory, model: { ...MODEL }, permissions: [], messages: [], busy: true, time: { created: Date.now() } };
      sessions.set(child.id, child);
      replies.push({ id: `per_child_${state.prompts}`, sessionID: child.id, action: "bash", resources: ["node *"], metadata: { command: "node child.mjs" } });
      state.childDone = () => { child.busy = false; complete(s, body.id); };
    } else if (mode === "silent" || state.silent) {
      // A session the server reports idle that never answers: nothing to count as progress.
      s.busy = false;
    } else if (mode === "intermediate") {
      complete(s, body.id); s.messages.at(-1).content[0].text = answer("intermediate"); s.busy = true;
      setTimeout(() => complete(s, body.id), 3500);
    } else if (["cancel", "cancel-unknown-tool", "cancel-before-admission", "cancel-child-scan", "transport-after-partial"].includes(mode)) {
      if (mode === "cancel-child-scan") {
        const child = { id: "ses_child", parentID: s.id, directory: s.directory, model: { ...MODEL }, permissions: [], messages: [], busy: true, time: { created: Date.now() } };
        sessions.set(child.id, child);
      }
      s.messages.push({ id: `msg_partial_${state.prompts}`, type: "assistant", agent: "build", model: { ...s.model }, time: { created: Date.now() },
        content: [{ type: "text", text: "partial work" }, { type: "tool", id: "call_running", name: "shell",
          state: { status: "running", input: { command: "long work" }, metadata: {} }, time: { created: Date.now() } }] });
    } else {
      complete(s, body.id, mode !== "correction" || state.prompts > 1);
      if (mode === "invalid-correction-busy" && state.prompts > 1) s.busy = true;
      if (mode === "partial-after-complete") s.busy = true;
    }
    // A request is waiting and the server reports the session idle; once it is answered the work takes state.slowMs more.
    if (["permission-slow", "question-slow"].includes(mode)) s.busy = false;
    if (mode === "lost-response") { req.socket.destroy(); return; }
    return json({ data: { id: body.id, sessionID: s.id, time: { created: Date.now() }, type: "user", payload: { text: body.text }, delivery: "steer" } });
  });
  await new Promise((resolve) => server.listen(0, "127.0.0.1", resolve));
  state.url = `http://127.0.0.1:${server.address().port}`;
  state.close = async () => { server.closeAllConnections(); await new Promise((resolve) => server.close(resolve)); };
  return state;
}

// The `opencode` the driver starts: a CLI on PATH that announces `url` as its server, records its start in
// `<dir>/opencode-started` and its SIGTERM in `<dir>/opencode-stopped`.
export function fakeCli(url, dir) {
  const bin = path.join(dir, "fake-bin"); fs.mkdirSync(bin, { recursive: true });
  const stopFile = path.join(dir, "opencode-stopped");
  const startFile = path.join(dir, "opencode-started");
  const script = path.join(bin, "opencode");
  fs.writeFileSync(script, `#!/usr/bin/env node\nconst fs=require("node:fs");\nfs.writeFileSync(process.env.FAKE_OPENCODE_START_FILE,"started");\nsetTimeout(()=>console.log("server listening on "+process.env.FAKE_OPENCODE_URL),Number(process.env.FAKE_OPENCODE_DELAY_MS||0));\nprocess.on("SIGTERM",()=>{fs.writeFileSync(process.env.FAKE_OPENCODE_STOP_FILE,"stopped");process.exit(0)});\nsetInterval(()=>{},1000);\n`, { mode: 0o755 });
  return { stopFile, env: { PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`,
    FAKE_OPENCODE_URL: url, FAKE_OPENCODE_START_FILE: startFile, FAKE_OPENCODE_STOP_FILE: stopFile }, startFile };
}

// An OpenCode Desktop store holding `state` as its model list, as Desktop's own SQLite keeps it.
export async function desktopStore(dir, state) {
  const { DatabaseSync } = await import("node:sqlite");
  const file = path.join(dir, "drafts.sqlite");
  const db = new DatabaseSync(file);
  db.exec("create table state (name text not null, key text not null, value text not null, updated_at integer not null, primary key (name, key))");
  db.prepare("insert into state values (?, ?, ?, ?)").run("opencode.global.dat", "model", JSON.stringify(state), Date.now());
  db.close();
  return file;
}
