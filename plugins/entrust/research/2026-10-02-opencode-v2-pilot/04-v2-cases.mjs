// The OpenCode adapter's V2 cases, retired from evals/opencode.test.mjs on 2026-10-08 with the V2 path
// itself (decision 4 of research/2026-10-08-driver-audit). A record, not a suite: they ran inside that file,
// against 02-v2-client.mjs and 03-fake-opencode-v2.mjs, with its helpers (driverRun, invoke, recent, prompt).

const V2 = "API_FAMILY: v2\nAGENT: bridge\n";

test("V2 text status checks only an explicitly named profile and prints two saved recent refs", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const r = await invoke([STATUS, "--api-family", "v2", "--directory", cwd, "--agent", "bridge"], "", {
      ENTRUST_OPENCODE_URL: s.url, ENTRUST_OPENCODE_CONNECTION: undefined,
      ...recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }, { providerID: "router", modelID: "glm" },
        { providerID: "router", modelID: "never-listed" }] }),
    });
    assert.equal(r.code, 0, r.err); assert.match(r.out, /apiFamily:v2/); assert.match(r.out, /AGENT=bridge/);
    assert.match(r.out, /MODEL=router\/deepseek\/flash variant=none availability=unknown/);
    assert.match(r.out, /MODEL=router\/glm variant=none availability=unknown/);
    assert.equal(r.out.includes("never-listed"), false);
    assert.equal(s.prompts, 0); assert.ok(s.calls.every((c) => c.method === "GET"));
    assert.equal(s.calls.some((c) => c.path === "/api/model"), false);
  } finally { await s.close(); }
});

test("JSON status reports both route families without loading their catalogs or profiles", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const r = await invoke([STATUS, "--format", "json"], "", {
      ENTRUST_OPENCODE_URL: s.url, ENTRUST_OPENCODE_CONNECTION: undefined,
      ...recent({ recent: [{ providerID: "router", modelID: "deepseek/flash" }] }),
    });
    assert.equal(r.code, 0, r.out + r.err);
    const data = JSON.parse(r.out);
    assert.deepEqual(data.routes.map((route) => [route.apiFamily, route.status]), [["v1", "available"], ["v2", "available"]]);
    assert.deepEqual(data.recent.models.map((m) => m.modelID), ["deepseek/flash"]);
    assert.equal(data.modelAvailability, "unknown");
    assert.equal(s.calls.some((c) => ["/provider", "/api/model", "/api/agent"].includes(c.path)), false);
    assert.equal(s.calls.some((c) => c.path.includes("/prompt") || c.path === "/api/session"), false);
  } finally { await s.close(); }
});

test("V2 selection is explicit and a new invocation needs its native profile", () => {
  assert.match(parsePrompt(prompt("API_FAMILY: auto\n")).error, /v1 or v2/);
  assert.match(parsePrompt(prompt("API_FAMILY: v2\n")).error, /AGENT/);
  assert.match(parsePrompt(prompt("API_FAMILY: v1\nAGENT: bridge\n")).error, /requires/);
  assert.equal(parsePrompt(prompt(V2)).apiFamily, "v2");
});

test("V2 profile cannot widen default deny into a global allow", () => {
  const p = { mode: "primary", permissions: [{ action: "*", resource: "*", effect: "deny" }, { action: "bash", resource: "*", effect: "ask" }] };
  assert.equal(validateProfile(p), p);
  for (const rule of [{ action: "bash", resource: "*", effect: "allow" }, { action: "unknown-plugin", resource: "*", effect: "ask" }])
    assert.throws(() => validateProfile({ ...p, permissions: [...p.permissions, rule] }), /default deny/);
});

test("V2 attribution follows promotion sequence rather than an input admitted during a step", () => {
  const events = [
    { type: "session.next.prompted", data: { messageID: "msg_first" } },
    { type: "session.next.prompt.admitted", data: { messageID: "msg_later" } },
    { type: "session.next.step.started", data: { assistantMessageID: "msg_a" } },
    { type: "session.next.prompted", data: { messageID: "msg_later" } },
    { type: "session.next.step.started", data: { assistantMessageID: "msg_b" } },
  ].map((e, i) => ({ ...e, durable: { aggregateID: "ses_test", seq: i + 1 } }));
  const messages = ["msg_b", "msg_a", "msg_unbound"].map((id) => ({ id, type: "assistant", model: { providerID: "router", id: "deepseek/flash" }, content: [] }));
  const out = normalizeMessages(messages, events, "ses_test");
  assert.deepEqual(out.map((m) => m.info.parentID), ["msg_first", "msg_later", null]);
  assert.equal(out[0].info.attribution.promptSeq, 1); assert.equal(out[1].info.attribution.stepSeq, 5);
  assert.throws(() => normalizeMessages(messages, [...events].reverse(), "ses_test"), /sequence/);
});

test("V2 driver uses native bodies and all history pages without any V1 execution route", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 0, r.err);
    assert.equal(r.report.apiFamily, "v2"); assert.equal(r.report.receiptOk, true); assert.equal(r.report.agent, "bridge");
    assert.deepEqual(Object.keys(s.calls.find((c) => c.path === "/api/session" && c.method === "POST").body).sort(),
      ["agent", "location", "model"]);
    assert.equal(s.calls.some((c) => c.path.startsWith("/session") || c.path === "/provider" || c.path === "/event"), false);
    const post = s.calls.find((c) => c.path.endsWith("/prompt"));
    assert.equal(post.body.delivery, "queue"); assert.equal(post.body.parts, undefined);
    assert.ok(s.calls.some((c) => c.path === "/api/agent"));
    assert.equal(s.calls.some((c) => c.path.startsWith("/api/agent/")), false);
    assert.ok(s.calls.some((c) => c.query.cursor)); assert.ok(s.calls.some((c) => Number(c.query.after) > 0));
    assert.ok(s.calls.filter((c) => c.path.endsWith("/history")).every((c) => Number(c.query.limit) <= 100));
    assert.ok(s.calls.filter((c) => c.path.endsWith("/message")).every((c) => Number(c.query.limit) <= 200));
  } finally { await s.close(); }
});

test("V2 continuation inherits family, profile, model and variant from its report", async () => {
  const s = await fakeOpenCodeV2();
  try {
    const first = await driverRun(s, { headers: V2 }); assert.equal(first.code, 0, first.err);
    const second = await driverRun(s, { resume: first.path }); assert.equal(second.code, 0, second.err);
    assert.equal(second.report.apiFamily, "v2"); assert.equal(second.report.sessionID, first.report.sessionID);
    assert.equal(second.report.model, first.report.model); assert.equal(second.report.variant, "high");
    assert.equal(s.calls.filter((c) => c.path.endsWith("/model") && c.method === "POST").length, 0);
    const rejected = await driverRun(s, { resume: second.path, headers: "API_FAMILY: v1\n" });
    assert.equal(rejected.code, 2); assert.match(rejected.report.error, /API family/); assert.equal(s.prompts, 2);
  } finally { await s.close(); }
});

test("V2 permissions preserve their native action/resources and reply once with 204", async () => {
  const s = await fakeOpenCodeV2("permission");
  try {
    const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations.map((m) => m.body), [{ reply: "once" }]);
    assert.deepEqual(s.replies.map((q) => q.id), ["per_foreign"]);
    const q = JSON.parse(fs.readFileSync(path.join(r.box, fs.readdirSync(r.box).find((f) => f.endsWith(".request.json")))));
    assert.equal(q.payload.action, "bash"); assert.deepEqual(q.payload.resources, ["printf native"]);
    assert.equal(q.payload.permission, undefined); assert.equal(r.report.commands[0].exitCode, 0);
  } finally { await s.close(); }
});

test("V2 replies for an owned child use its session ID rather than the root", async () => {
  const s = await fakeOpenCodeV2("child-permission");
  try {
    const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.equal(s.mutations[0].sessionID, "ses_child"); assert.ok(r.report.childUsage.ses_child);
  } finally { await s.close(); }
});

test("V2 question round trip uses its session-scoped native route", async () => {
  const s = await fakeOpenCodeV2("question");
  try { const r = await driverRun(s, { headers: V2, approval: "answer" }); assert.equal(r.code, 0, r.err);
    assert.deepEqual(s.mutations.map((m) => m.body), [{ answers: [["Read"]] }]); }
  finally { await s.close(); }
});

test("V2 discovers a child and its callback in another native location", async () => {
  const s = await fakeOpenCodeV2("child-other-dir");
  try {
    const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 0, r.err);
    assert.equal(s.mutations[0].sessionID, "ses_child"); assert.ok(r.report.childUsage.ses_child);
    assert.deepEqual(s.replies.map((q) => q.id), ["per_foreign"]);
    assert.ok(s.calls.some((c) => c.path === "/api/session/ses_child/permission"));
    assert.equal(s.calls.some((c) => c.path === "/api/session" && c.method === "GET" && c.query.directory), false);
  } finally { await s.close(); }
});

test("V2 Stop interrupts its session, clears its question and retains partial attribution", async () => {
  const s = await fakeOpenCodeV2("cancel-question");
  try {
    const r = await driverRun(s, { headers: V2, approval: "hold", cancel: true, cancelWhenPending: true });
    assert.equal(r.code, 3, r.err); assert.equal(r.report.cancellation.observed, "idle");
    assert.equal(r.report.cancellation.abort[0].ok, true); assert.equal(s.questions.length, 0);
    assert.equal(s.aborts.includes("ses_foreign"), false); assert.equal(r.report.receiptOk, false);
  } finally { await s.close(); }
});

test("V2 reconciles a lost or 503 prompt response from durable admission without resend", async () => {
  for (const mode of ["lost-response", "server-error-after-admission"]) {
    const s = await fakeOpenCodeV2(mode);
    try { const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 0, r.err); assert.equal(s.prompts, 1); }
    finally { await s.close(); }
  }
});

test("V2 refuses SDK substitution and an unsafe agent before creating a session", async () => {
  for (const mode of ["unsupported-sdk", "broad-profile"]) {
    const s = await fakeOpenCodeV2(mode);
    try { const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 2, r.err); assert.equal(s.prompts, 0);
      assert.equal(s.calls.some((c) => c.path === "/api/session" && c.method === "POST"), false); }
    finally { await s.close(); }
  }
});

test("V2 unexpected callback success status is unknown and not resent", async () => {
  const s = await fakeOpenCodeV2("unexpected-reply-status");
  try { const r = await driverRun(s, { headers: V2, approval: "accept" }); assert.equal(r.code, 4, r.err);
    assert.equal(r.report.receiptOk, false); assert.equal(s.mutations.length, 1); }
  finally { await s.close(); }
});

test("V2 refuses a changed session model before submitting any input", async () => {
  const s = await fakeOpenCodeV2("changed-created-model");
  try { const r = await driverRun(s, { headers: V2 }); assert.equal(r.code, 1, r.err);
    assert.equal(s.prompts, 0); assert.match(r.report.error, /selected model/); }
  finally { await s.close(); }
});

test("V2 malformed active state cannot be an idle success", async () => {
  const s = await fakeOpenCodeV2("malformed-active");
  try { const r = await driverRun(s, { headers: V2 }); assert.notEqual(r.code, 0); assert.equal(r.report.receiptOk, false); }
  finally { await s.close(); }
});
