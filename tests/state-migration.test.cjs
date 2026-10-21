const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const State=js('state/schema.js'),Unify=js('migrations/unify-1500.js'),Life=js('domain/life/model.js'),Store=js('storage/local-store.js');
const key=()=> '2026-10-20';
test('a fresh install contains no personal records',()=>{const db=Unify.run(State.create(),key);for(const k of ['workouts','meals','body','facts','events','cycles'])assert.equal(db[k].length,0,k);assert.ok(db.imports.includes('unify-life-v15'))});
test('backups from the future are refused',()=>assert.throws(()=>State.parseBackup(JSON.stringify({app:'PULSE',schemaVersion:99999,data:State.create()})),/neueren/));
test('NaN never slips through as a number',()=>{const x=State.create();x.days['2026-10-20']={water:NaN};assert.throws(()=>State.normalize(x))});
function legacy(){const db=State.create();
 db.inbox=[
  {id:'i-task',text:'Katzenfutter kaufen',type:'task',due:'2026-10-21',done:false,status:'current',recordedAt:'2026-10-19T10:00:00Z'},
  {id:'i-note',text:'Idee für einen Song',type:'note',done:false,status:'current',lifeMeta:{room:'ideen',body:'Refrain über Nebel',steps:[{text:'Melodie summen',done:true}],photos:['ph-a1']}},
  {id:'i-food',text:'Pizza gegessen',type:'food-capture',done:false,status:'current'},
  {id:'i-done',text:'Altglas',type:'task',done:true,status:'completed'}];
 db.tasks=[{id:'i-task',title:'Katzenfutter kaufen',due:'2026-10-21'},{id:'t-2',title:'Steuer',due:'2026-11-01'}];
 db.events=[{id:'cal-1',type:'calendar-plan',title:'Zahnarzt',date:'2026-10-22',time:'15:00',status:'planned'},{id:'trip',type:'travel-plan',title:'Reise',validFrom:'2026-10-01',validTo:'2026-10-02'}];
 db.life={version:1,items:[{id:'life-x',kind:'project',title:'Album',body:'',status:'open',room:'ideen',steps:[]}],preferences:{},draft:null,focus:null};
 db.inbox[1].lifeMeta.parent='life-x';
 return db}
test('tasks, notes and appointments move into one store with their ids',()=>{
 const db=Unify.run(legacy(),key),ids=db.life.items.map(x=>x.id).sort();
 assert.deepEqual(ids,['event:cal-1','inbox:i-done','inbox:i-note','inbox:i-task','life-x','tasks:t-2']);
 const note=db.life.items.find(x=>x.id==='inbox:i-note');assert.equal(note.room,'ideen');assert.equal(note.body,'Refrain über Nebel');assert.equal(note.parent,'life-x');assert.deepEqual(note.photos,['ph-a1']);assert.equal(note.steps[0].done,true);
 assert.equal(db.life.items.find(x=>x.id==='event:cal-1').time,'15:00');assert.equal(db.life.items.find(x=>x.id==='inbox:i-done').status,'done');
 assert.deepEqual(db.inbox.map(x=>x.id),['i-food']);assert.equal(db.tasks.length,0);assert.deepEqual(db.events.map(e=>e.id),['trip']);
 Life.validate(db.life)});
test('the unified list shows each item once',()=>{const db=Unify.run(legacy(),key);const list=Life.list(db,{archived:true});const ids=list.map(x=>x.id);assert.equal(new Set(ids).size,ids.length);assert.ok(ids.includes('inbox:i-food'),'review item stays visible')});
test('migration is idempotent',()=>{const once=Unify.run(legacy(),key);const twice=Unify.run(JSON.parse(JSON.stringify(once)),key);assert.deepEqual(twice.life.items,once.life.items);assert.deepEqual(twice.inbox,once.inbox)});
test('storage detects edits from another window',()=>{const mem=new Map();const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
 const s=Store.create({getStorage:()=>storage,state:State,migrate:v=>Unify.run(v,key)});const db=s.load();db.waterGoal=3;s.save(db);mem.set('pulseOS',mem.get('pulseOS').replace('"waterGoal":3','"waterGoal":4'));assert.throws(()=>s.save(db),e=>e.code==='CONFLICT')});
test('a backup round-trips through export and restore',()=>{const mem=new Map();const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>mem.set(k,String(v))};
 const s=Store.create({getStorage:()=>storage,state:State,migrate:v=>Unify.run(v,key)});const db=s.load();const text=s.exportText(Unify.run(legacy(),key));const restored=s.restore(text,db);assert.equal(restored.life.items.length,6);assert.ok(mem.has('pulseOS_pre_import_backup'))});
test('a full quota makes old safety copies give way to the current data',()=>{
 const mem=new Map(),LIMIT=60000;const used=()=>[...mem].reduce((a,[k,v])=>a+k.length+v.length,0);
 const storage={getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>{const old=mem.has(k)?k.length+mem.get(k).length:0;if(used()-old+k.length+String(v).length>LIMIT){const e=new Error('quota');e.name='QuotaExceededError';throw e}mem.set(k,String(v))},removeItem:k=>mem.delete(k),get length(){return mem.size},key:i=>[...mem.keys()][i]};
 const s=Store.create({getStorage:()=>storage,state:State,migrate:v=>Unify.run(v,key)});const db=s.load();
 mem.set('pulseOS_pre_migration_backup','x'.repeat(30000));
 db.settings.note='y'.repeat(29500);assert.doesNotThrow(()=>s.save(db));
 assert.equal(mem.has('pulseOS_pre_migration_backup'),false,'old copy removed');assert.ok(mem.get('pulseOS').includes('yyyy'));
 const u=s.usage();assert.ok(u.used>25000&&u.freedBackups);
 db.settings.note='z'.repeat(70000);assert.throws(()=>s.save(db),e=>e.code==='WRITE_FAILED');
});
function fakeIdb(){let main=null;return {get main(){return main},getMain:async()=>main&&{...main},putMain:async(rec,expected)=>{if(expected!=null&&main&&main.rev!==expected){const e=Error('conflict');e.code='CONFLICT';throw e}main={...rec}},deleteMain:async()=>{main=null}}}
function quotaStorage(limit){const mem=new Map();const used=()=>[...mem].reduce((a,[k,v])=>a+k.length+v.length,0);return {mem,getItem:k=>mem.has(k)?mem.get(k):null,setItem:(k,v)=>{const old=mem.has(k)?k.length+mem.get(k).length:0;if(used()-old+k.length+String(v).length>limit){const e=new Error('quota');e.name='QuotaExceededError';throw e}mem.set(k,String(v))},removeItem:k=>mem.delete(k),get length(){return mem.size},key:i=>[...mem.keys()][i]}}
test('when localStorage is full, the state moves to IndexedDB and loads from there next time',async()=>{
 const ls=quotaStorage(40000),idb=fakeIdb(),errors=[];
 const s=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key),idb,onAsyncError:e=>errors.push(e)});const db=s.load();
 db.settings.note='x'.repeat(60000);assert.doesNotThrow(()=>s.save(db));assert.equal(s.mode,'idb');await s.flush();
 assert.equal(errors.length,0);assert.ok(idb.main.text.includes('xxxx'));assert.equal(ls.mem.has('pulseOS'),false,'localStorage copy removed');assert.match(ls.getItem('pulseOS_meta'),/"where":"idb"/);
 db.waterGoal=3.5;s.save(db);db.waterGoal=4;s.save(db);await s.flush();assert.equal(idb.main.rev,3);
 const s2=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key),idb});assert.equal(s2.needsAsyncLoad(),true);
 const again=await s2.loadAsync();assert.equal(again.waterGoal,4);assert.equal(again.settings.note.length,60000);
 const noIdb=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key)});assert.throws(()=>noIdb.load(),e=>e.code==='READ_FAILED','never starts empty over moved data');
});
test('two windows in IndexedDB mode cannot overwrite each other',async()=>{
 const ls=quotaStorage(40000),idb=fakeIdb();
 const a=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key),idb});const db=a.load();db.settings.note='y'.repeat(60000);a.save(db);await a.flush();
 const errs=[];const b=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key),idb,onAsyncError:e=>errs.push(e)});const dbB=await b.loadAsync();
 db.waterGoal=5;a.save(db);await a.flush();
 dbB.waterGoal=6;b.save(dbB);await b.flush();assert.equal(errs[0]?.code,'CONFLICT');assert.equal(JSON.parse(idb.main.text).waterGoal,5);
});
test('a marker without data in IndexedDB falls back to localStorage',async()=>{
 const ls=quotaStorage(1e9),idb=fakeIdb();const s=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key),idb});const db=s.load();db.waterGoal=2.5;s.save(db);
 ls.setItem('pulseOS_meta',JSON.stringify({where:'idb',rev:1}));
 const s2=Store.create({getStorage:()=>ls,state:State,migrate:v=>Unify.run(v,key),idb});const back=await s2.loadAsync();assert.equal(back.waterGoal,2.5);assert.equal(ls.getItem('pulseOS_meta'),null);
});
