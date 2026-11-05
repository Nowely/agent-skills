#!/usr/bin/env node
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { ChildProcess, spawn, spawnSync } from "node:child_process";
import { test } from "node:test";
import { fileURLToPath, pathToFileURL } from "node:url";
import { startLocalServer, startOwnedServer } from "../plugin/skills/opencode/scripts/local-server.mjs";

const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const localModule = pathToFileURL(fileURLToPath(new URL("../plugin/skills/opencode/scripts/local-server.mjs", import.meta.url))).href;
const ownerScript = fileURLToPath(new URL("../plugin/skills/opencode/scripts/server-owner.mjs", import.meta.url));
const alive = (pid) => { try { process.kill(pid, 0); return true; } catch (e) { return e.code === "EPERM"; } };
const portOpen = async (url) => {
  try { return (await fetch(`${url}/api/info`, { signal: AbortSignal.timeout(300) })).ok; } catch { return false; }
};
const waitFor = async (fn, timeoutMs = 8000) => {
  const end = Date.now() + timeoutMs;
  while (Date.now() < end) { const value = await fn(); if (value) return value; await sleep(30); }
  throw new Error("condition not observed before timeout");
};
const readJson = (file) => { try { return JSON.parse(fs.readFileSync(file, "utf8")); } catch { return null; } };
// Only a process with this fixture's unique command is signalled in failure cleanup.
function killFixture(pid, command) {
  if (!pid) return;
  const r = spawnSync("ps", ["-ww", "-o", "uid=,command=", "-p", String(pid)], { encoding: "utf8" });
  const m = r.stdout.trim().match(/^(\d+)\s+([\s\S]+)$/);
  if (r.status === 0 && m && Number(m[1]) === process.getuid() && m[2].includes(command)) {
    try { process.kill(pid, "SIGKILL"); } catch {}
  }
}
function fixture({ delayMs = 0, ignoreTerm = false, holdOpenApi = false } = {}) {
  const dir = fs.mkdtempSync("/tmp/entrust-owner-test-"), bin = path.join(dir, "bin"), record = path.join(dir, "server.json"), held = path.join(dir, "held");
  fs.mkdirSync(bin);
  const cli = path.join(bin, "opencode");
  fs.writeFileSync(cli, `#!/usr/bin/env node
const fs=require('node:fs'),http=require('node:http');
const record=process.env.OWNER_FAKE_RECORD;
const state={pid:process.pid,ppid:process.ppid,ipc:!!process.connected,url:null,cwd:process.cwd(),envMarker:process.env.OWNER_ENV_MARKER};
fs.writeFileSync(record,JSON.stringify(state));
const server=http.createServer((req,res)=>{if(${holdOpenApi}&&req.url==='/openapi.json'){fs.writeFileSync(process.env.OWNER_HELD,'held');return}res.setHeader('content-type','application/json');res.end(JSON.stringify({version:'fake',pid:process.pid}))});
process.on('SIGTERM',()=>{if(!${ignoreTerm})server.close(()=>process.exit(0))});
setTimeout(()=>server.listen(0,'127.0.0.1',()=>{state.url='http://127.0.0.1:'+server.address().port;fs.writeFileSync(record,JSON.stringify(state));console.log('server listening on '+state.url)}),${delayMs});
setInterval(()=>{},1000);
`, { mode: 0o755 });
  const env = { ...process.env, PATH: `${bin}${path.delimiter}${process.env.PATH ?? ""}`, OWNER_FAKE_RECORD: record, OWNER_HELD: held, OWNER_ENV_MARKER: "synthetic-env", OWNER_CWD: dir };
  return { dir, cli, record, held, env, cleanup() {
    const rec = readJson(record); killFixture(rec?.pid, cli); killFixture(rec?.ppid, ownerScript);
    fs.rmSync(dir, { recursive: true, force: true });
  } };
}

test("normal close reaps its child, closes its listener, and leaves a foreign process alone", { timeout: 15000 }, async () => {
  const f = fixture(), foreign = spawn(process.execPath, ["-e", "setInterval(()=>{},1000)"], { stdio: "ignore" });
  let server;
  try {
    server = await startLocalServer({ env: f.env });
    const rec = await waitFor(() => readJson(f.record));
    assert.equal(rec.ipc, false); assert.notEqual(rec.ppid, process.pid);
    assert.equal(await portOpen(rec.url), true);
    assert.deepEqual(await server.close(), { process: "exited", owner: "exited" });
    assert.deepEqual(await server.close(), { process: "exited", owner: "exited" });
    assert.equal(alive(rec.ppid), false);
    assert.equal(await portOpen(rec.url), false); assert.equal(alive(foreign.pid), true);
  } finally { await server?.close(); foreign.kill("SIGKILL"); f.cleanup(); }
});

test("public startLocalServer works from node --input-type=module", { timeout: 15000 }, async () => {
  const f = fixture();
  try {
    const source = `import {startLocalServer} from ${JSON.stringify(localModule)}; const server=await startLocalServer({cwd: process.env.OWNER_CWD}); console.log(JSON.stringify(await server.close()));`;
    const result = spawnSync(process.execPath, ["--input-type=module", "-e", source], { env: f.env, encoding: "utf8", timeout: 12000 });
    assert.equal(result.status, 0, result.stderr);
    assert.deepEqual(JSON.parse(result.stdout), { process: "exited", owner: "exited" });
    const rec = readJson(f.record); assert.ok(rec?.url); assert.equal(await portOpen(rec.url), false);
    assert.equal(rec.cwd, fs.realpathSync(f.dir)); assert.equal(rec.envMarker, "synthetic-env");
    assert.equal(alive(rec.pid), false); assert.equal(alive(rec.ppid), false);
  } finally { f.cleanup(); }
});

test("actual OpenCode driver SIGKILL during startup reaps owner and server and closes the listener", { timeout: 15000 }, async () => {
  const f = fixture({ holdOpenApi: true }), input = path.join(f.dir, "prompt.txt"), report = path.join(f.dir, "report.json");
  const driverPath = fileURLToPath(new URL("../plugin/skills/opencode/scripts/driver.mjs", import.meta.url));
  fs.writeFileSync(input, `RIGHTS: read ${f.dir}\nALLOW_NO_COMMANDS: yes\nTASK: synthetic\n`);
  const driver = spawn(process.execPath, [driverPath, "--prompt-file", input, "--report-file", report],
    { env: { ...f.env, ENTRUST_STATE_DIR: f.dir }, stdio: "ignore" });
  try {
    await waitFor(() => fs.existsSync(f.held));
    const rec = readJson(f.record); assert.ok(rec.url); assert.equal(await portOpen(rec.url), true);
    driver.kill("SIGKILL");
    await waitFor(() => !alive(rec.pid)); await waitFor(() => !alive(rec.ppid));
    assert.equal(await portOpen(rec.url), false);
  } finally { if (driver.exitCode === null && driver.signalCode === null) driver.kill("SIGKILL"); f.cleanup(); }
});

test("actual OpenCode driver SIGKILL after admission reaps owner and server and closes the listener", { timeout: 15000 }, async () => {
  const f = fixture(), input = path.join(f.dir, "prompt.txt"), report = path.join(f.dir, "report.json"), admitted = path.join(f.dir, "admitted");
  const driverPath = fileURLToPath(new URL("../plugin/skills/opencode/scripts/driver.mjs", import.meta.url));
  fs.writeFileSync(f.cli, `#!/usr/bin/env node
const fs=require('node:fs'),http=require('node:http');let input=null;
const paths={"/api/session":{get:{},post:{}},"/api/session/active":{get:{}},"/api/session/{sessionID}":{get:{}},"/api/session/{sessionID}/prompt":{post:{}},"/api/session/{sessionID}/message":{get:{}},"/api/session/{sessionID}/interrupt":{post:{}},"/api/session/{sessionID}/model":{post:{}},"/api/session/{sessionID}/permission":{get:{}},"/api/session/{sessionID}/permission/{requestID}/reply":{post:{}},"/api/session/{sessionID}/form":{get:{}},"/api/session/{sessionID}/form/{formID}/reply":{post:{}},"/api/session/{sessionID}/form/{formID}":{delete:{}}};
const server=http.createServer(async(req,res)=>{let chunks=[];for await(const c of req)chunks.push(c);const body=chunks.length?JSON.parse(Buffer.concat(chunks)):null,u=new URL(req.url,'http://localhost'),p=u.pathname;let value;
if(p==='/api/info')value={version:'2.1.2',pid:process.pid};
else if(p==='/openapi.json')value={paths};
else if(p==='/api/model')value={data:[{id:'deepseek/flash',providerID:'router',enabled:true,variants:[]}]};
else if(p==='/api/session'&&req.method==='POST')value={data:{id:'ses_owned',model:body.model,permissions:body.permissions}};
else if(p==='/api/session')value={data:[]};
else if(p==='/api/session/active')value={data:input?{ses_owned:{type:'running'}}:{}};
else if(p.endsWith('/permission')||p.endsWith('/form'))value={data:[]};
else if(p.endsWith('/message'))value={data:input?[{id:input,type:'user',time:{created:Date.now()}}]:[]};
else if(p.endsWith('/prompt')){input=body.id;fs.writeFileSync(process.env.OWNER_ADMITTED,'admitted');value={data:{id:input}}}
else{res.writeHead(404);res.end();return}res.setHeader('content-type','application/json');res.end(JSON.stringify(value))});
process.on('SIGTERM',()=>server.close(()=>process.exit(0)));
server.listen(0,'127.0.0.1',()=>{const url='http://127.0.0.1:'+server.address().port;fs.writeFileSync(process.env.OWNER_FAKE_RECORD,JSON.stringify({pid:process.pid,ppid:process.ppid,ipc:!!process.connected,url}));console.log('server listening on '+url)});
`, { mode: 0o755 });
  fs.writeFileSync(input, `RIGHTS: read ${f.dir}\nMODEL: router/deepseek/flash\nALLOW_NO_COMMANDS: yes\nTASK: synthetic\n`);
  const driver = spawn(process.execPath, [driverPath, "--prompt-file", input, "--report-file", report],
    { env: { ...f.env, ENTRUST_STATE_DIR: f.dir, OWNER_ADMITTED: admitted }, stdio: "ignore" });
  try {
    await waitFor(() => fs.existsSync(admitted));
    const rec = readJson(f.record); assert.equal(await portOpen(rec.url), true);
    driver.kill("SIGKILL");
    await waitFor(() => !alive(rec.pid)); await waitFor(() => !alive(rec.ppid));
    assert.equal(await portOpen(rec.url), false);
  } finally { if (driver.exitCode === null && driver.signalCode === null) driver.kill("SIGKILL"); f.cleanup(); }
});

test("an uncooperative server receives SIGKILL and its listener closes", { timeout: 15000 }, async () => {
  const f = fixture({ ignoreTerm: true }); let server;
  try {
    server = await startLocalServer({ env: f.env }); const rec = readJson(f.record);
    const before = Date.now();
    assert.deepEqual(await server.close(), { process: "exited", owner: "exited" });
    assert.ok(Date.now() - before >= 1800); assert.equal(await portOpen(rec.url), false);
  } finally { await server?.close(); f.cleanup(); }
});

test("an exited child is never signalled even when a descendant holds its output pipes", { timeout: 10000 }, async () => {
  const f = fixture(), holder = path.join(f.dir, "holder.js"), holderPid = path.join(f.dir, "holder.pid");
  fs.writeFileSync(holder, "setInterval(()=>{},1000)\n");
  fs.writeFileSync(f.cli, `#!/usr/bin/env node
const fs=require('node:fs'),{spawn}=require('node:child_process');
const c=spawn(process.execPath,[${JSON.stringify(holder)}],{detached:true,stdio:['ignore',1,2]});c.unref();fs.writeFileSync(${JSON.stringify(holderPid)},String(c.pid));process.exit(0);
`, { mode: 0o755 });
  const attempts = [], original = ChildProcess.prototype.kill;
  ChildProcess.prototype.kill = function (signal) { attempts.push({ exitCode: this.exitCode, signalCode: this.signalCode, signal }); return original.call(this, signal); };
  try {
    await assert.rejects(startOwnedServer({ env: f.env, timeoutMs: 5000 }), /exited with code 0/);
    assert.deepEqual(attempts, []);
  } finally {
    ChildProcess.prototype.kill = original;
    let pid; try { pid = Number(fs.readFileSync(holderPid, "utf8")); } catch {}
    killFixture(pid, holder);
    if (pid) await waitFor(() => !alive(pid));
    f.cleanup();
  }
});

test("startup abort closes its not-yet-ready server", { timeout: 15000 }, async () => {
  const f = fixture({ delayMs: 4000 }), controller = new AbortController();
  const starting = startLocalServer({ env: f.env, signal: controller.signal });
  try {
    const rec = await waitFor(() => readJson(f.record)); controller.abort();
    await assert.rejects(starting, /startup was cancelled/);
    await waitFor(() => !alive(rec.pid));
  } finally { controller.abort(); await starting.catch(() => {}); f.cleanup(); }
});

test("an immediate startup abort is handled without an unhandled rejection or a surviving child", { timeout: 15000 }, async () => {
  const f = fixture({ delayMs: 4000 }), controller = new AbortController();
  try {
    const starting = startLocalServer({ env: f.env, signal: controller.signal });
    controller.abort();
    await assert.rejects(starting, /startup was cancelled/);
    const rec = readJson(f.record);
    if (rec) { await waitFor(() => !alive(rec.pid)); await waitFor(() => !alive(rec.ppid)); }
  } finally { f.cleanup(); }
});

test("owner death during startup reports unknown cleanup instead of claiming the server stopped", { timeout: 15000 }, async () => {
  const f = fixture({ delayMs: 4000 });
  const starting = startLocalServer({ env: f.env });
  let rec;
  try {
    rec = await waitFor(() => readJson(f.record));
    const ps = spawnSync("ps", ["-ww", "-o", "uid=,ppid=,command=", "-p", String(rec.ppid)], { encoding: "utf8" });
    const match = ps.stdout.trim().match(/^(\d+)\s+(\d+)\s+([\s\S]+)$/);
    assert.ok(ps.status === 0 && match && Number(match[1]) === process.getuid()
      && Number(match[2]) === process.pid && match[3].includes(ownerScript));
    process.kill(rec.ppid, "SIGKILL");
    await assert.rejects(starting, (error) => error.serverCleanup?.process === "unknown" && error.serverCleanup?.owner === "exited");
  } finally {
    await starting.catch(() => {});
    if (rec?.pid) { killFixture(rec.pid, f.cli); await waitFor(() => !alive(rec.pid)); }
    f.cleanup();
  }
});

test("an unavailable owner cwd reports startup failure without hanging", { timeout: 12000 }, async () => {
  const f = fixture();
  try { await assert.rejects(startLocalServer({ cwd: path.join(f.dir, "missing"), env: f.env })); }
  finally { f.cleanup(); }
});

test("a closed owner IPC before start fails without an unhandled error", { timeout: 12000 }, async () => {
  const f = fixture(), preload = path.join(f.dir, "close-ipc.cjs");
  fs.writeFileSync(preload, `const cp=require('node:child_process'),{syncBuiltinESMExports}=require('node:module'),original=cp.fork;
cp.fork=function(...args){const child=original(...args);if(String(args[0]).endsWith('/server-owner.mjs')){const send=child.send.bind(child);child.send=(...parts)=>{child.disconnect();return send(...parts)}}return child};syncBuiltinESMExports();`);
  try {
    const source = `import {startLocalServer} from ${JSON.stringify(localModule)};try{await startLocalServer();process.exitCode=1}catch(e){console.log(e.message)}`;
    const result = spawnSync(process.execPath, ["--require", preload, "--input-type=module", "-e", source], { env: f.env, encoding: "utf8", timeout: 10000 });
    assert.equal(result.status, 0, result.stderr);
    assert.match(result.stdout, /owner IPC is unavailable|owner exited before startup/);
    assert.equal(fs.existsSync(f.record), false);
  } finally { f.cleanup(); }
});

test("a hung owner with open IPC cannot hold startup indefinitely", { timeout: 18000 }, async () => {
  const f = fixture({ delayMs: 4000 }), controller = new AbortController();
  const starting = startLocalServer({ env: f.env, timeoutMs: 400, signal: controller.signal });
  let rec;
  try {
    rec = await waitFor(() => readJson(f.record));
    const ps = spawnSync("ps", ["-ww", "-o", "uid=,ppid=,command=", "-p", String(rec.ppid)], { encoding: "utf8" });
    const match = ps.stdout.trim().match(/^(\d+)\s+(\d+)\s+([\s\S]+)$/);
    assert.ok(ps.status === 0 && match && Number(match[1]) === process.getuid()
      && Number(match[2]) === process.pid && match[3].includes(ownerScript));
    process.kill(rec.ppid, "SIGSTOP");
    const result = await Promise.race([
      starting.then(() => ({ state: "started" }), (error) => ({ state: "rejected", error })),
      sleep(10500).then(() => ({ state: "hung" })),
    ]);
    assert.equal(result.state, "rejected", "startup stayed pending with the owner stopped and IPC open");
    assert.match(result.error.message, /owner startup timed out/);
    assert.equal(result.error.serverCleanup?.process, "unknown");
    const remaining = readJson(f.record);
    assert.ok(remaining?.url); assert.equal(await portOpen(remaining.url), true);
  } finally {
    if (rec?.ppid) {
      const ps = spawnSync("ps", ["-ww", "-o", "uid=,ppid=,command=", "-p", String(rec.ppid)], { encoding: "utf8" });
      const match = ps.stdout.trim().match(/^(\d+)\s+(\d+)\s+([\s\S]+)$/);
      if (ps.status === 0 && match && Number(match[1]) === process.getuid() && Number(match[2]) === process.pid && match[3].includes(ownerScript))
        try { process.kill(rec.ppid, "SIGCONT"); } catch {}
    }
    controller.abort(); await starting.catch(() => {});
    if (rec?.pid) {
      const remaining = readJson(f.record);
      killFixture(rec.pid, f.cli); await waitFor(() => !alive(rec.pid));
      if (remaining?.url) assert.equal(await portOpen(remaining.url), false);
    }
    f.cleanup();
  }
});

for (const beforeReady of [true, false]) test(`driver SIGKILL ${beforeReady ? "before" : "after"} readiness reaps its own server`, { timeout: 15000 }, async () => {
  const f = fixture({ delayMs: beforeReady ? 4000 : 0 }), ready = path.join(f.dir, "ready"), script = path.join(f.dir, "driver.mjs");
  fs.writeFileSync(script, `import fs from 'node:fs';import{startLocalServer}from ${JSON.stringify(localModule)};const server=await startLocalServer();fs.writeFileSync(process.env.OWNER_READY,'ready');setInterval(()=>{},1000);`);
  const driver = spawn(process.execPath, [script], { env: { ...f.env, OWNER_READY: ready }, stdio: "ignore" });
  try {
    const rec = await waitFor(() => readJson(f.record));
    if (!beforeReady) { await waitFor(() => fs.existsSync(ready)); assert.equal(await portOpen(readJson(f.record).url), true); }
    driver.kill("SIGKILL");
    await waitFor(() => !alive(rec.pid));
    await waitFor(() => !alive(rec.ppid));
    if (!beforeReady) assert.equal(await portOpen(readJson(f.record).url), false);
  } finally { if (driver.exitCode === null && driver.signalCode === null) driver.kill("SIGKILL"); f.cleanup(); }
});

test("lost IPC closes the listener while its driver remains alive and yields unknown cleanup", { timeout: 15000 }, async () => {
  const f = fixture(), ready = path.join(f.dir, "result.json"), script = path.join(f.dir, "driver.mjs");
  fs.writeFileSync(script, `import fs from 'node:fs';import{startLocalServer}from ${JSON.stringify(localModule)};const server=await startLocalServer();const owner=process._getActiveHandles().find(h=>h.connected&&typeof h.send==='function');if(!owner)throw Error('owner handle missing');for(const event of ['disconnect','exit','close'])owner.on(event,()=>process.stderr.write(event+'\\n'));owner.disconnect();await new Promise(r=>setTimeout(r,500));process.stderr.write('calling close\\n');fs.writeFileSync(process.env.OWNER_READY,JSON.stringify(await server.close()));setInterval(()=>{},1000);`);
  const driver = spawn(process.execPath, [script], { env: { ...f.env, OWNER_READY: ready }, stdio: ["ignore", "ignore", "pipe"] });
  let stderr = ""; driver.stderr.on("data", (chunk) => { stderr += chunk; });
  try {
    const result = await waitFor(() => readJson(ready)).catch((error) => { throw new Error(`${error.message}; driver exit=${driver.exitCode}, signal=${driver.signalCode}, stderr=${stderr.slice(0, 1000)}`); });
    const rec = readJson(f.record);
    assert.equal(alive(driver.pid), true); assert.equal(await portOpen(rec.url), false);
    assert.deepEqual(result, { process: "unknown", owner: "exited" });
    assert.equal(alive(rec.ppid), false);
  } finally { if (driver.exitCode === null && driver.signalCode === null) driver.kill("SIGKILL"); f.cleanup(); }
});

test("parallel owners stop only their own listeners", { timeout: 15000 }, async () => {
  const a = fixture(), b = fixture(); let one, two;
  try {
    [one, two] = await Promise.all([startLocalServer({ env: a.env }), startLocalServer({ env: b.env })]);
    const ar = readJson(a.record), br = readJson(b.record);
    assert.notEqual(ar.ppid, br.ppid); assert.notEqual(ar.url, br.url);
    assert.equal(await portOpen(ar.url), true); assert.equal(await portOpen(br.url), true);
    await one.close(); assert.equal(await portOpen(ar.url), false); assert.equal(await portOpen(br.url), true);
    await two.close(); assert.equal(await portOpen(br.url), false);
  } finally { await one?.close(); await two?.close(); a.cleanup(); b.cleanup(); }
});

test("an exited server process does not prove a detached descendant's listener closed", { timeout: 15000 }, async () => {
  const f = fixture(), holder = path.join(f.dir, "listener.js"), childRecord = path.join(f.dir, "listener.json");
  fs.writeFileSync(holder, `const fs=require('node:fs'),http=require('node:http');const s=http.createServer((q,r)=>r.end(JSON.stringify({version:'fake',pid:process.pid})));s.listen(0,'127.0.0.1',()=>fs.writeFileSync(${JSON.stringify(childRecord)},JSON.stringify({pid:process.pid,url:'http://127.0.0.1:'+s.address().port})));`);
  fs.writeFileSync(f.cli, `#!/usr/bin/env node
const fs=require('node:fs'),{spawn}=require('node:child_process');const c=spawn(process.execPath,[${JSON.stringify(holder)}],{detached:true,stdio:'ignore'});c.unref();process.on('SIGTERM',()=>process.exit(0));
const timer=setInterval(()=>{if(!fs.existsSync(${JSON.stringify(childRecord)}))return;clearInterval(timer);const x=JSON.parse(fs.readFileSync(${JSON.stringify(childRecord)}));fs.writeFileSync(process.env.OWNER_FAKE_RECORD,JSON.stringify({pid:process.pid,ppid:process.ppid,ipc:!!process.connected,url:x.url}));console.log('server listening on '+x.url)},20);setInterval(()=>{},1000);
`, { mode: 0o755 });
  let server, child;
  try {
    server = await startLocalServer({ env: f.env }); child = readJson(childRecord);
    assert.equal(await portOpen(child.url), true);
    assert.deepEqual(await server.close(), { process: "exited", owner: "exited" });
    assert.equal(await portOpen(child.url), true, "the detached synthetic listener is a separate process");
  } finally {
    await server?.close();
    child ??= readJson(childRecord);
    if (child?.pid) { killFixture(child.pid, holder); await waitFor(() => !alive(child.pid)); assert.equal(await portOpen(child.url), false); }
    f.cleanup();
  }
});
