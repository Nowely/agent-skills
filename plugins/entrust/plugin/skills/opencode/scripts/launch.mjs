// What the shared launcher, orchestrate/scripts/agent-run.mjs, takes from the OpenCode adapter: its driver,
// the server an invocation is pinned to, the environment the driver gets for it, and the typed requests
// (a permission, a question) the driver adds to the mailbox beside the launcher's command requests.
import crypto from "node:crypto";
import path from "node:path";
import { fileURLToPath } from "node:url";

export const driver = path.join(path.dirname(fileURLToPath(import.meta.url)), "driver.mjs");

// --new: the backend an invocation records in agent/backend.json, and never changes. The plan row, when
// there is one, pins the model and the writes; the connection file's credentials are never copied.
export function prepare({ adapter, row, saved, env, refuse, readJson }) {
  const planModel = row?.model ?? null, planWrites = row?.writes ?? null;
  const connectionFile = env.ENTRUST_OPENCODE_CONNECTION ?? null;
  if (connectionFile && !path.isAbsolute(connectionFile)) refuse("ENTRUST_OPENCODE_CONNECTION must be absolute");
  let savedConnection = null;
  try { savedConnection = connectionFile ? readJson(connectionFile) : null; }
  catch { refuse("ENTRUST_OPENCODE_CONNECTION could not be read as JSON"); }
  if (connectionFile && !savedConnection) refuse("ENTRUST_OPENCODE_CONNECTION could not be read as JSON");
  const raw = env.ENTRUST_OPENCODE_URL || savedConnection?.url;
  let record;
  if (raw) {
    let serverUrl;
    try {
      const u = new URL(raw);
      if (!["http:", "https:"].includes(u.protocol) || u.username || u.password || u.search || u.hash) throw new Error();
      serverUrl = u.href.replace(/\/$/, "");
      if (savedConnection?.url && new URL(savedConnection.url).href.replace(/\/$/, "") !== serverUrl) throw new Error();
    } catch { refuse("OpenCode remote server URL must be http(s), without credentials, query or fragment; connection and URL must agree"); }
    record = { adapter, planModel, planWrites, serverUrl, connectionFile };
  } else {
    if (connectionFile) refuse("ENTRUST_OPENCODE_CONNECTION does not contain a server URL");
    record = { adapter, planModel, planWrites, localServer: true };
  }
  if (saved && JSON.stringify(saved) !== JSON.stringify(record))
    refuse("OpenCode backend, endpoint and approved plan are immutable for this invocation; use a fresh report path");
  return record;
}

// The driver's environment for a recorded backend: its server, or the private local one.
export function env(saved, base) {
  const out = { ...base,
    ...(saved?.serverUrl ? { ENTRUST_OPENCODE_URL: saved.serverUrl } : {}),
    ...(saved?.connectionFile ? { ENTRUST_OPENCODE_CONNECTION: saved.connectionFile } : {}) };
  if (saved?.localServer) {
    out.ENTRUST_OPENCODE_LOCAL = "1";
    delete out.ENTRUST_OPENCODE_URL;
    delete out.ENTRUST_OPENCODE_CONNECTION;
  }
  return out;
}

const sha256 = (s) => crypto.createHash("sha256").update(s).digest("hex");

// A permission or a question the driver wrote: its body is the native request, bound to the decision by its
// hash and remote identity, and a question is answered rather than accepted.
export function typedRequest(q) {
  if (q?.type !== "opencode.permission" && q?.type !== "opencode.question") return null;
  const question = q.type === "opencode.question";
  const presented = String(q.presented ?? JSON.stringify(q.payload, null, 2));
  return {
    presented,
    decisions: question ? ["answer", "decline"] : ["accept", "decline"],
    lines: (field, token) => [`REQUEST=${q.id}`, `TYPE=${q.type}`, `SERVER=${field(q.remote?.serverURL)}`,
      `SESSION=${field(q.remote?.sessionID)}`, `INVOCATION=${field(q.remote?.invocationId)}`,
      `METHOD=${field(q.method)}`, `CAUSE=${field(q.cause)}`, `CWD=${field(q.cwd)}`, `REASON=${field(q.reason)}`,
      `DEADLINE=${field(q.deadlineAt)}`, `REQUEST_BODY<<${token}`, presented, `REQUEST_BODY>>${token}`],
    fits: (d) => d?.requestHash === q.requestHash && JSON.stringify(d?.remote) === JSON.stringify(q.remote),
    envelopeError: () => (q.requestHash !== sha256(JSON.stringify(q.payload))
      || q.presented !== JSON.stringify(q.payload, null, 2) || q.remote?.requestID !== q.payload?.id
      || q.remote?.sessionID !== q.payload?.sessionID)
      ? "typed request content or remote identity does not match its immutable envelope" : null,
    record: { requestHash: q.requestHash, remote: q.remote },
    // A question's answer, read from stdin: one array of labels per displayed question.
    ...(question ? {
      acceptRefusal: "a question needs --answer (JSON answers on stdin) or --decline",
      readAnswer: (text) => {
        let answer;
        try { if (typeof text !== "string") throw new Error(); answer = JSON.parse(text); }
        catch { return { error: "--answer expects JSON {answers: string[][]} on stdin" }; }
        const questions = q.payload?.questions;
        if (!answer || Object.keys(answer).some((k) => k !== "answers") || !Array.isArray(answer.answers)
          || !Array.isArray(questions) || answer.answers.length !== questions.length
          || answer.answers.some((a, i) => !Array.isArray(a) || !a.length || a.some((s) => typeof s !== "string" || !s.trim())
            || (!questions[i].multiple && a.length !== 1)
            || (questions[i].custom === false && a.some((s) => !(questions[i].options ?? []).some((o) => o.label === s)))))
          return { error: "answers do not match the pending questions" };
        return { answer };
      },
    } : {}),
  };
}
