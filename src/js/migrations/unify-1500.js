// SOURCE: migrations/unify-1500.js
/* PULSE 15: tasks, notes and planned appointments move into one store (life.items).
   Ids stay identical ("inbox:…", "tasks:…", "event:…"), so links, drafts, focus and undo keep working.
   Unclear captures waiting for review (food, drinks, workout sets, past dates) stay in the review queue. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./return-20261019.js'),require('../state/schema.js'),require('../domain/life/model.js'));else root.PulseUnify=factory(root.PulseReturnUpgrade,root.PulseState,root.PulseLife)})(globalThis,function(previous,state,Life){
 'use strict';
 const MARKER='unify-life-v15';
 const REVIEW=new Set(['food-capture','drink-capture','workout-capture','workout-set','historical-review','food','drink','workout']);
 function unify(db){
  if(db.imports.includes(MARKER))return db;
  const life=Life.ensure(db),known=new Set(life.items.map(x=>x.id)),moved={inbox:new Set(),tasks:new Set(),event:new Set()};
  for(const x of Life.list(db,{archived:true})){
   if(x.origin==='life'||known.has(x.id))continue;
   const split=x.id.indexOf(':'),store=x.id.slice(0,split),rid=x.id.slice(split+1);
   const rec=store==='event'?(db.events||[]).find(e=>String(e.id)===rid):(db[store]||[]).find((r,i)=>String(r.id??i)===rid);
   if(!rec||(store!=='event'&&REVIEW.has(rec.type)&&!rec.lifeMeta))continue;
   const item={...x,title:x.title||'Eintrag',repeat:x.repeat||0,photos:x.photos||[],createdAt:x.createdAt||'',updatedAt:x.updatedAt||x.createdAt||''};
   delete item.origin;
   life.items.push(item);known.add(item.id);moved[store].add(rid);
  }
  db.inbox=(db.inbox||[]).filter((r,i)=>!moved.inbox.has(String(r.id??i)));
  db.tasks=(db.tasks||[]).filter((r,i)=>!moved.tasks.has(String(r.id??i))&&!(r.id!=null&&moved.inbox.has(String(r.id))));
  db.events=(db.events||[]).filter(e=>!(e.type==='calendar-plan'&&moved.event.has(String(e.id))));
  db.imports.push(MARKER);
  Life.validate(life);
  return db;
 }
 function run(input,key){return state.normalize(unify(previous.run(input,key)))}
 return {run,unify,MARKER};
});

