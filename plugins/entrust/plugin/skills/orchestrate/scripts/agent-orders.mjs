import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { checkSchemaSubset, validateOutput } from "./json-schema.mjs";

const schema = JSON.parse(fs.readFileSync(new URL("../schemas/main-proxy.schema.json", import.meta.url), "utf8"));

export function readAgentOrders(report, mode, cataloguePath = null) {
  if (!report.ok || !report.receiptOk || !report.outputSchemaOk || report.partial)
    throw new Error("agent orders require a successful, attributed, complete coordinator reply");
  // An adapter's report names its external session as sessionID (OpenCode) or threadId (Codex).
  const session = report.sessionID ?? report.threadId;
  if (typeof mode?.external_session !== "string" || !mode.external_session
    || typeof session !== "string" || !session)
    throw new Error("agent orders require the saved coordinator session binding");
  if (mode.external_session !== session)
    throw new Error("the coordinator report belongs to another external session");
  const agents = mode.agents;
  if (!agents || typeof agents !== "object" || Array.isArray(agents))
    throw new Error("agent orders require the saved agent bindings object");
  const check = validateOutput(schema, report.answerJson);
  if (!check.ok) throw new Error(check.errors.join("; "));
  if (!report.answerJson.requests.length && !report.answerJson.final_answer.trim())
    throw new Error("the coordinator final answer must contain nonblank text");
  const catalogue = typeof cataloguePath === "string" ? JSON.parse(fs.readFileSync(cataloguePath, "utf8")) : cataloguePath;
  const ids = new Set();
  const known = new Set(Object.keys(agents));
  const planned = new Set();
  for (const request of report.answerJson.requests) {
    if ((request.action === "delegate" || request.action === "continue") && !request.task.trim())
      throw new Error(`agent task must contain nonblank text: ${request.id}`);
    if (request.action === "delegate" && !request.scope.trim())
      throw new Error(`agent scope must contain nonblank text: ${request.id}`);
    if (ids.has(request.id)) throw new Error(`duplicate request id: ${request.id}`);
    ids.add(request.id);
    if (request.action === "invoke") {
      const capability = catalogue?.capabilities?.find((c) => c.id === request.capability);
      if (!capability) throw new Error(`unknown capability: ${request.capability}`);
      if (!request.capability.trim() || !request.purpose.trim()) throw new Error(`invoke requires nonblank capability and purpose: ${request.id}`);
      const inputKind = capability.inputKind ?? "object";
      if (!["object", "string"].includes(inputKind) || (inputKind === "string" ? typeof request.input !== "string" : !Object.hasOwn(request, "arguments")))
        throw new Error(`capability ${request.capability}: input kind mismatch (expected ${inputKind})`);
      if (inputKind === "object" && capability.argumentsSchema) {
        const subset = checkSchemaSubset(capability.argumentsSchema);
        const args = subset.ok ? validateOutput(capability.argumentsSchema, request.arguments) : subset;
        if (!args.ok) throw new Error(`capability ${request.capability}: ${args.errors.join("; ")}`);
      }
    } else if (request.action === "delegate") {
      const defaults = mode.defaultWorker;
      const model = request.model ?? defaults?.model, effort = request.effort ?? defaults?.effort;
      if (!model || !effort || model === "inherit" || effort === "inherit") throw new Error(`delegate requires explicit model and effort: ${request.id}`);
      const worker = catalogue?.workerModels?.find((w) => w.model === model);
      if (!worker || !worker.efforts.includes(effort))
        throw new Error(`unsupported worker model/effort: ${model}/${effort}`);
      if (known.has(request.agent_id)) throw new Error(`agent identity already exists: ${request.agent_id}`);
      known.add(request.agent_id);
      planned.add(request.agent_id);
    } else {
      const referenced = request.agent_ids ?? [request.agent_id];
      if (new Set(referenced).size !== referenced.length) throw new Error(`repeated agent identity in ${request.id}`);
      for (const id of referenced) {
        if (!known.has(id)) throw new Error(`unknown agent identity: ${id}`);
        if (planned.has(id)) continue;
        const binding = agents[id];
        if (!binding || typeof binding !== "object" || Array.isArray(binding)
          || !Object.hasOwn(binding, "native_agent") || typeof binding.native_agent !== "string"
          || !binding.native_agent.trim()) throw new Error(`missing native agent binding: ${id}`);
      }
    }
  }
  return report.answerJson;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  try {
    if (process.argv.length < 4 || process.argv.length > 5) throw new Error("usage: node agent-orders.mjs REPORT MODE_RECORD [CATALOGUE]");
    const report = JSON.parse(fs.readFileSync(process.argv[2], "utf8"));
    const mode = JSON.parse(fs.readFileSync(process.argv[3], "utf8"));
    process.stdout.write(`${JSON.stringify(readAgentOrders(report, mode, process.argv[4] ?? null))}\n`);
  } catch (error) {
    process.stderr.write(`${error.message}\n`);
    process.exitCode = 2;
  }
}
