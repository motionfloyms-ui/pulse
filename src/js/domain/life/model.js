// SOURCE: domain/life/model.js
/* PULSE Lebensräume: shared records and local projections. No automatic completions. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./recur.js'):root.PulseRecur);if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseLife=api})(globalThis,function(Recur){
'use strict';
const ROOMS=[
{id:'alltag',name:'Alltag',sub:'Pläne, Projekte & kleine Schritte',color:'peach',symbol:'arch',prompt:'Was würde morgen ein bisschen leichter machen?'},
{id:'innen',name:'Innenleben',sub:'Gedanken, Gefühle & Bedürfnisse',color:'lilac',symbol:'wave',prompt:'Was braucht gerade Raum, ohne gelöst werden zu müssen?'},
{id:'sinn',name:'Sinn & Rituale',sub:'Praxis, Fragen & persönliche Bedeutung',color:'plum',symbol:'star',prompt:'Was möchte ich bewusster in mein Leben einladen?'},
{id:'koerper',name:'Essen & Körper',sub:'Versorgung, Bewegung & Erholung',color:'green',symbol:'leaf',prompt:'Was tut mir heute gut?'},
{id:'menschen',name:'Menschen',sub:'Verbindungen & gemeinsame Zeit',color:'rose',symbol:'link',prompt:'Mit wem möchte ich etwas Schönes teilen?'},
{id:'ideen',name:'Ideen & Lernen',sub:'Neugier, Ausdruck & neue Wege',color:'yellow',symbol:'sun',prompt:'Was würde ich ausprobieren, wenn es noch nicht gut sein müsste?'},
{id:'draussen',name:'Draußen',sub:'Natur, Entdeckungen & unterwegs sein',color:'blue',symbol:'mountain',prompt:'Was möchte ich beim nächsten Mal genauer ansehen?'},
{id:'zuhause',name:'Zuhause',sub:'Haushalt, Dinge & ein guter Ort',color:'sand',symbol:'home',prompt:'Welche kleine Veränderung würde mir hier guttun?'}
];
const KINDS={note:'Notiz',task:'Aufgabe',event:'Termin',project:'Projekt',ritual:'Ritual',recipe:'Rezept'};
const STATUSES=['open','done','waiting','parked','archived'];
const clone=x=>JSON.parse(JSON.stringify(x));
const validDate=s=>{if(!s)return true;if(typeof s!=='string'||!/^\d{4}-\d{2}-\d{2}$/.test(s))return false;const d=new Date(s+'T12:00:00Z');return Number.isFinite(d.getTime())&&d.toISOString().slice(0,10)===s};
const validTime=s=>!s||/^([01]\d|2[0-3]):[0-5]\d$/.test(s);
function offset(day,n){const d=new Date(day+'T12:00:00Z');d.setUTCDate(d.getUTCDate()+n);return d.toISOString().slice(0,10)}
function room(id){return ROOMS.find(r=>r.id===id)||ROOMS[0]}
function ensure(db){if(!db.life)db.life={version:1,items:[],preferences:{},draft:null,focus:null};if(!db.life.preferences)db.life.preferences={};return db.life}
function validate(life){
 if(!life||typeof life!=='object'||Array.isArray(life)||life.version!==1||!Array.isArray(life.items))throw Error('Lebensräume-Daten haben ein unbekanntes Format.');
 const ids=new Set();
 for(const x of life.items){
  if(!x||typeof x.id!=='string'||!x.id||ids.has(x.id)||!KINDS[x.kind]||typeof x.title!=='string'||typeof x.body!=='string'||!STATUSES.includes(x.status)||!ROOMS.some(r=>r.id===x.room))throw Error('Ungültiger Lebensräume-Eintrag.');
  ids.add(x.id);
  if(!validDate(x.date)||!validDate(x.deadline)||!validTime(x.time)||x.duration!=null&&(!Number.isFinite(x.duration)||x.duration<1||x.duration>1440))throw Error('Ungültige Zeitangabe in Lebensräume.');
  if(!Array.isArray(x.steps)||x.steps.some(s=>!s||typeof s.text!=='string'||typeof s.done!=='boolean'))throw Error('Ungültige Schritte.');
  if(x.url&&!/^https?:\/\/\S+$/i.test(x.url))throw Error('Ungültiger Link.');
  if(x.photos!=null&&(!Array.isArray(x.photos)||x.photos.some(id=>typeof id!=='string')))throw Error('Ungültige Fotoverweise.');
 }
 if(life.preferences!=null&&(typeof life.preferences!=='object'||Array.isArray(life.preferences)))throw Error('Ungültige Ansichtsoptionen.');
 if(life.draft!=null){const d=life.draft;if(typeof d!=='object'||Array.isArray(d)||typeof d.id!=='string'||!KINDS[d.kind]||typeof d.title!=='string'||typeof d.body!=='string'||!Array.isArray(d.steps))throw Error('Ungültiger Entwurf.')}
 if(life.focus){const f=life.focus;if(!['running','paused'].includes(f.state)||typeof f.title!=='string'||!Number.isFinite(f.remaining)||f.remaining<0||!Number.isFinite(f.total)||f.total<=0||(f.state==='running'&&!Number.isFinite(f.endsAt))||(f.endsAt!=null&&!Number.isFinite(f.endsAt)))throw Error('Ungültiger Fokus.')}
 return life;
}
function list(db,{archived=false}={}){
 const out=(db.life?.items||[]).map(x=>({...x,origin:'life'}));
 const seen=new Set();
 for(const store of ['inbox','tasks'])for(const [i,r] of (db[store]||[]).entries()){
  if(r.status==='superseded'||r.status==='cancelled'&&r.lifeMeta?.status!=='archived')continue;
  const dedupe=String(r.id);if(r.id&&seen.has(dedupe))continue;if(r.id)seen.add(dedupe);
  const m=r.lifeMeta||{},body=r.text||r.title||'Eintrag';
  out.push({id:store+':'+(r.id??i),origin:store,kind:r.type==='task'||store==='tasks'?'task':'note',title:body.split('\n')[0].slice(0,180),body:m.body??body,room:m.room||(/food|drink|workout|context/.test(r.type||'')?'koerper':'alltag'),date:r.due||'',time:r.time||'',deadline:m.deadline||'',duration:m.duration||25,status:r.status==='cancelled'?'archived':r.done?'done':r.deferred?'parked':m.status==='waiting'?'waiting':'open',parent:m.parent||'',source:m.source||'',steps:m.steps||[],url:m.url||'',createdAt:r.recordedAt||r.date||'',updatedAt:r.updatedAt||'',repeat:m.repeat||0,resume:m.resume||'',photos:m.photos||[]});
 }
 for(const r of db.events||[])if(r.type==='calendar-plan'&&r.status!=='superseded'&&(r.status!=='cancelled'||r.lifeMeta?.status==='archived')){
  const m=r.lifeMeta||{},extra={};for(const k of Recur.EXTRA)if(m[k]!=null)extra[k]=m[k];
  out.push({...extra,id:'event:'+r.id,origin:'event',kind:'event',title:r.title||'Termin',body:m.body||'',room:m.room||'alltag',date:r.date||'',time:r.time||'',deadline:m.deadline||'',duration:m.duration||30,status:r.status==='cancelled'?'archived':r.status==='completed'?'done':'open',parent:m.parent||'',source:m.source||'',steps:m.steps||[],url:m.url||'',createdAt:r.recordedAt||'',updatedAt:r.updatedAt||'',resume:m.resume||'',photos:m.photos||[]});
 }
 return out.filter(x=>archived||x.status!=='archived');
}
function get(db,id){return list(db,{archived:true}).find(x=>x.id===id)}
function clean(fields,old={}){
 const x={...old,...fields};
 x.kind=KINDS[x.kind]?x.kind:'note';x.room=room(x.room).id;
 x.title=String(x.title||'').trim().slice(0,180)||String(x.body||'').trim().split('\n')[0].slice(0,100);
 if(!x.title)throw Error('Ein Titel oder Gedanke fehlt noch.');
 x.body=String(x.body||'').slice(0,60000);x.status=STATUSES.includes(x.status)?x.status:'open';
 for(const field of ['date','time','deadline','parent','source','url','resume'])x[field]=String(x[field]||'').trim();
 if(!validDate(x.date)||!validDate(x.deadline)||!validTime(x.time))throw Error('Bitte Datum und Uhrzeit prüfen.');
 if(x.time&&!x.date)throw Error('Zu einer Uhrzeit gehört auch ein Datum.');
 if(x.kind==='event'&&!x.date)throw Error('Wähle einen Tag für den Termin.');
 x.duration=Number(x.duration||(x.kind==='event'?60:25));if(!Number.isFinite(x.duration)||x.duration<1||x.duration>1440)throw Error('Dauer: 1 bis 1440 Minuten.');
 if(x.url&&!/^https?:\/\/\S+$/i.test(x.url))throw Error('Ein Link beginnt mit https:// oder http://.');
 x.steps=Array.isArray(x.steps)?x.steps.map(s=>({text:String(s.text||'').slice(0,500),done:!!s.done})).filter(s=>s.text.trim()):[];
 x.repeat=[0,1,7,14,30].includes(Number(x.repeat))?Number(x.repeat):0;
 x.photos=Array.isArray(x.photos)?[...new Set(x.photos.filter(id=>typeof id==='string'&&/^ph-[a-z0-9]+$/.test(id)))].slice(0,8):[];
 if(x.kind==='event')Object.assign(x,Recur.normalize(x));
 return x;
}
function create(db,fields,id,now){
 const state=ensure(db),x=clean(fields);if(get(db,id))throw Error('Eintrag bereits vorhanden.');
 if(x.parent&&get(db,x.parent)?.kind!=='project')throw Error('Das Projekt ist nicht mehr verfügbar.');
 Object.assign(x,{id,createdAt:now,updatedAt:now});state.items.push(x);return x;
}
function legacyRecord(db,id){const split=id.indexOf(':'),store=id.slice(0,split),rid=id.slice(split+1);return (db[store==='event'?'events':store]||[]).find((r,i)=>String(r.id??i)===rid)}
function update(db,id,fields,now){
 const old=get(db,id);if(!old)throw Error('Dieser Eintrag ist nicht mehr vorhanden.');
 const x=clean(fields,old);
 if(x.parent===id)throw Error('Ein Projekt kann sich nicht selbst enthalten.');
 if(x.parent&&get(db,x.parent)?.kind!=='project')throw Error('Das Projekt ist nicht mehr verfügbar.');
 const visited=new Set([id]);let ancestor=x.parent;while(ancestor){if(visited.has(ancestor))throw Error('Projekte können keinen Kreis bilden.');visited.add(ancestor);ancestor=get(db,ancestor)?.parent||''}
 x.updatedAt=now;
 if(old.origin==='life'){const dest=ensure(db).items.find(r=>r.id===id);Object.assign(dest,x);delete dest.origin;return dest}
 const r=legacyRecord(db,id);if(!r)throw Error('Eintrag nicht gefunden.');
 r.lifeMeta={title:x.title,body:x.body,room:x.room,deadline:x.deadline,duration:x.duration,status:x.status,parent:x.parent,source:x.source,steps:x.steps,url:x.url,repeat:x.repeat,resume:x.resume,photos:x.photos,...(x.kind==='event'?Object.fromEntries(Recur.EXTRA.map(k=>[k,x[k]])):{})};
 if(old.origin==='event'){r.title=x.title;r.date=x.date;r.time=x.time;r.status=x.status==='archived'?'cancelled':x.status==='done'?'completed':'planned'}
 else {if(r.text!==undefined)r.text=x.title;else r.title=x.title;r.due=x.date||null;r.time=x.time;r.done=x.status==='done';r.deferred=['parked','archived'].includes(x.status);r.status=x.status==='archived'?'cancelled':r.done?'completed':'current'}
 r.updatedAt=now;return x;
}
function toggle(db,id,now,today,newId){
 const x=get(db,id);if(!x||x.kind!=='task')throw Error('Nur Aufgaben werden abgehakt.');
 const done=x.status!=='done';update(db,id,{status:done?'done':'open'},now);
 if(done&&x.repeat&&!list(db,{archived:true}).some(y=>y.repeatOf===x.id)){const next=offset(today,x.repeat);create(db,{...x,origin:undefined,title:x.title,status:'open',date:next,time:'',deadline:'',steps:x.steps.map(s=>({...s,done:false})),source:x.id,repeatOf:x.id,repeat:x.repeat},newId,now)}
 return done;
}
function day(db,date){return dayFrom(list(db),date)}
/* Same as day(), from an already built list (one list for a whole month view). */
function dayFrom(items,date){
 const out=[];
 for(const x of items){
  if(['parked','archived'].includes(x.status)||!['task','event','ritual'].includes(x.kind))continue;
  if(x.kind==='event'&&(x.recur||x.endDate)){const o=Recur.occurrence(x,date);if(o)out.push({...x,date,seriesDate:x.date,occ:o});continue}
  if(x.date===date)out.push(x);
 }
 return out.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
}
function search(db,query='',kind='',roomId='',archived=false){
 const q=query.trim().toLocaleLowerCase('de');
 return list(db,{archived}).filter(x=>(!archived||x.status==='archived')&&(!kind||x.kind===kind)&&(!roomId||x.room===roomId)&&(!q||[x.title,x.body,room(x.room).name,...x.steps.map(s=>s.text)].join(' ').toLocaleLowerCase('de').includes(q))).sort((a,b)=>(b.updatedAt||b.createdAt).localeCompare(a.updatedAt||a.createdAt));
}
function startFocus(db,item,minutes,now){
 const sec=Number(minutes)*60;if(!Number.isFinite(sec)||sec<60||sec>86400)throw Error('Bitte eine passende Fokusdauer wählen.');
 ensure(db).focus={id:item?.id||'',title:item?.title||'Zeit für mich',state:'running',total:sec,remaining:sec,endsAt:now+sec*1000,startedAt:now,resume:item?.resume||''};
 return db.life.focus;
}
function remaining(f,now){if(!f)return 0;return f.state==='running'?Math.max(0,Math.ceil((f.endsAt-now)/1000)):Math.max(0,Math.ceil(f.remaining))}
function pauseFocus(db,now,resume){const f=ensure(db).focus;if(!f)return;f.remaining=remaining(f,now);f.state='paused';f.endsAt=null;if(resume!==undefined)f.resume=String(resume)}
function resumeFocus(db,now){const f=ensure(db).focus;if(!f)return;f.state='running';f.endsAt=now+f.remaining*1000}
return {ROOMS,KINDS,ensure,validate,list,get,create,update,toggle,day,dayFrom,search,room,offset,validDate,validTime,startFocus,remaining,pauseFocus,resumeFocus,clone};
});



