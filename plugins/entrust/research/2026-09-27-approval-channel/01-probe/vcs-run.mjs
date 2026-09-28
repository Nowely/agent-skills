// Runs one command with a given cwd, records argv, exit code, stdout and stderr whole.
// Usage: node vcs-run.mjs <label> <grantJSON|none|unsandboxed> <cwd> -- <argv...>
//   grantJSON: extra filesystem entries merged into entrust_read's filesystem table, e.g. {"/x":"write"}
//   extra codex sandbox flags can be passed via env VCS_RUN_FLAGS (space-separated)
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";

const [label, grant, cwd, sep, ...argv] = process.argv.slice(2);
if (sep !== "--") { console.error("usage"); process.exit(2); }
const dir = path.dirname(new URL(import.meta.url).pathname);
const out = path.join(dir, "vcs-transcript.jsonl");
let cmd, args;
if (grant === "unsandboxed") { cmd = argv[0]; args = argv.slice(1); }
else {
  const fsEntries = { ":tmpdir": "write", ...(grant === "none" ? {} : JSON.parse(grant)) };
  const fsToml = "{" + Object.entries(fsEntries).map(([k, v]) => `${JSON.stringify(k)}=${JSON.stringify(v)}`).join(",") + "}";
  const extra = (process.env.VCS_RUN_FLAGS ?? "").split(" ").filter(Boolean);
  cmd = "codex";
  // `--strict-config` is refused by `codex sandbox` ("not supported"), so it is omitted here.
  args = [
    "-c",'permissions.entrust_read.extends=":read-only"',
    "-c", `permissions.entrust_read.filesystem=${fsToml}`,
    "-c", "permissions.entrust_read.network={enabled=true}",
    "-c", 'default_permissions="entrust_read"',
    "sandbox", ...extra, "-P", "entrust_read", "-C", cwd, "--", ...argv];
}
const t0 = Date.now();
const r = spawnSync(cmd, args, { cwd, encoding: "utf8", timeout: 90000,
  env: { ...process.env, CODEX_HOME: path.join(dir, "home-vcs"), VCS_PAGER: "cat", PAGER: "cat" } });
const rec = { t: new Date().toISOString(), label, cmd, args, cwd, ms: Date.now() - t0,
  exit: r.status, signal: r.signal, error: r.error?.message ?? null, stdout: r.stdout, stderr: r.stderr };
fs.appendFileSync(out, JSON.stringify(rec) + "\n");
console.log(`# ${label}\n$ ${cmd} ${args.map((a) => (/[\s"{}]/.test(a) ? `'${a}'` : a)).join(" ")}\nexit=${r.status} signal=${r.signal} ms=${rec.ms} error=${rec.error}\n--- stdout (${(r.stdout ?? "").length} bytes)\n${(r.stdout ?? "").slice(0, 3000)}\n--- stderr (${(r.stderr ?? "").length} bytes)\n${(r.stderr ?? "").slice(0, 6000)}`);
