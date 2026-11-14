import assert from 'node:assert/strict';

export const fixtures = [
  {name:'create and update', seed:[{name:'Old',email:'ann@site.test'}], text:'name,email\nNew Ann, ANN@site.test \nBob,bob@site.test\n', expected:{created:1,updated:1,rejected:[]}},
  {name:'normalized new duplicates and invalid last row', seed:[], text:'name,email\nBob,bob@site.test\nRobert, BOB@SITE.TEST \n,bob@site.test\n', expected:{created:1,updated:0,rejected:[{line:4,reason:'name is empty'}]}},
  {name:'existing valid duplicate survives later rejection', seed:[{name:'Old',email:'ann@site.test'}], text:'name,email\nAnn,ann@site.test\nAnne, ANN@SITE.TEST \n,ann@site.test\n', expected:{created:0,updated:1,rejected:[{line:4,reason:'name is empty'}]}},
  {name:'whitespace and missing fields retain rejection lines', seed:[], text:'name,email\n   \n""\nNameOnly\nBad,not-an-address\nGood,good@site.test\n', expected:{created:1,updated:0,rejected:[{line:2,reason:'name is empty'},{line:3,reason:'name is empty'},{line:4,reason:'email is not an address'},{line:5,reason:'email is not an address'}]}},
  {name:'multiline records retain physical line numbers', seed:[], text:'name,email\n"Lee,\nAnn",ann@site.test\n,bad@site.test\n', expected:{created:1,updated:0,rejected:[{line:4,reason:'name is empty'}]}},
  {name:'same existing name preserves frozen import policy', seed:[{name:'Ann',email:'ann@site.test'}], text:'name,email\nAnn, ANN@SITE.TEST \n', expected:null},
];
const malformed = 'name,email\nBob,bob@site.test\n"Never closes,ann@site.test\n';
const resultOf = (r) => ({created:r.created,updated:r.updated,rejected:r.rejected});
const semanticState = (store) => store.all().map(({name,email})=>({name,email})).sort((a,b)=>a.email.localeCompare(b.email));
async function opened(tree, seed=[]) {
  const {ContactStore}=await tree('src/contacts/store.js');
  const api=await tree('src/contacts/import.js');
  const store=new ContactStore();
  for(const row of seed) store.insert({...row});
  return {store,...api};
}
function guardPreview(store) {
  const all=store.all.bind(store), find=store.findByEmail.bind(store), before=structuredClone(all());
  const writes=[], views=new WeakMap();
  const view=(value)=> {
    if(value===null || typeof value!=='object') return value;
    if(!views.has(value)) views.set(value,new Proxy(value,{
      set(){writes.push('contact mutation');throw new Error('preview attempted contact mutation');},
      deleteProperty(){writes.push('contact deletion');throw new Error('preview attempted contact deletion');},
      defineProperty(){writes.push('contact definition');throw new Error('preview attempted contact definition');},
    }));
    return views.get(value);
  };
  store.findByEmail=(email)=>view(find(email));
  store.all=()=>all().map(view);
  for(const name of ['insert','rename']) store[name]=()=>{writes.push(name);throw new Error(`preview called ${name}`);};
  return ()=>{assert.deepEqual(writes,[],'preview attempted a write');assert.deepEqual(all(),before,'preview changed contacts');};
}
const checks=[];
for(const f of fixtures) {
  checks.push({name:`preview: ${f.name}`,run:async(tree,baseline)=>{
    const a=await opened(baseline,f.seed), expected=resultOf(a.importContacts(f.text,a.store));
    if(f.expected) assert.deepEqual(expected,f.expected,'frozen baseline violates fixed fixture expectation');
    const b=await opened(tree,f.seed);assert.equal(typeof b.previewImport,'function');
    const verify=guardPreview(b.store);
    for(let repeat=0;repeat<2;repeat++){assert.deepEqual(resultOf(b.previewImport(f.text,b.store)),expected);verify();}
  }});
  checks.push({name:`compatibility: ${f.name}`,run:async(tree,baseline)=>{
    const a=await opened(baseline,f.seed), b=await opened(tree,f.seed);
    const oldResult=resultOf(a.importContacts(f.text,a.store));
    if(f.expected) assert.deepEqual(oldResult,f.expected,'frozen baseline violates fixed fixture expectation');
    assert.deepEqual(resultOf(b.importContacts(f.text,b.store)),oldResult);
    assert.deepEqual(semanticState(b.store),semanticState(a.store));
  }});
}
checks.push({name:'preview: malformed file never writes',run:async(tree)=>{
  const b=await opened(tree,[{name:'Ann',email:'ann@site.test'}]);assert.equal(typeof b.previewImport,'function');const verify=guardPreview(b.store);
  assert.throws(()=>b.previewImport(malformed,b.store));verify();
}});
checks.push({name:'compatibility: malformed file preserves existing contacts',run:async(tree,baseline)=>{
  for(const load of [baseline,tree]) {const x=await opened(load,[{name:'Ann',email:'ann@site.test'}]);const before=structuredClone(x.store.all());assert.throws(()=>x.importContacts(malformed,x.store));assert.deepEqual(x.store.all(),before);}
}});
export default checks;
