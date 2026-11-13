import path from 'node:path';
import {fileURLToPath,pathToFileURL} from 'node:url';
import {spawnSync} from 'node:child_process';
const self=fileURLToPath(import.meta.url);
const [mode,suiteName,repo,baseline,index]=process.argv.slice(2);
const suites={old:'old-accept.mjs',preview:'preview-accept.mjs'};
if(!suites[suiteName] || !repo) throw new Error('Use run.mjs <check|all> <old|preview> <repo> <baseline-or-repo> [index]');
const suite=(await import(new URL(suites[suiteName],import.meta.url))).default;
const loader=(root)=>(file)=>import(pathToFileURL(path.join(root,file)).href);
if(mode==='check') {
  try {await suite[Number(index)].run(loader(repo),loader(baseline||repo));process.stdout.write(JSON.stringify({status:'passed'})+'\n');}
  catch(error){process.stdout.write(JSON.stringify({status:'failed',error:String(error.stack||error)})+'\n');process.exitCode=1;}
} else if(mode==='all') {
  const checks=suite.map((item,i)=>{
    const run=spawnSync(process.execPath,[self,'check',suiteName,repo,baseline||repo,String(i)],{encoding:'utf8',timeout:5000,maxBuffer:2*1024*1024});
    let detail;try{detail=JSON.parse(run.stdout.trim());}catch{}
    return {name:item.name,status:run.error||run.signal||run.status===13?'unfinished':run.status===0&&detail?.status==='passed'?'passed':'failed',exit:run.status,signal:run.signal||null,error:run.error?.code||detail?.error||((run.stderr||'').trim()||null)};
  });
  process.stdout.write(JSON.stringify({suite:suiteName,planned:checks.length,passed:checks.filter(c=>c.status==='passed').length,failed:checks.filter(c=>c.status==='failed').length,unfinished:checks.filter(c=>c.status==='unfinished').length,checks},null,2)+'\n');
  if(checks.some(c=>c.status!=='passed'))process.exitCode=1;
} else throw new Error('Unknown mode');
