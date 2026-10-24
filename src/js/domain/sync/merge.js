// SOURCE: domain/sync/merge.js
/* Abgleich: phone and Quest each keep their own PULSE. A package carries the shared content from one
   device to the other: entries of the Lebensräume (notes, tasks, dates, notebook pages), sigils, tarot
   (daily cards and own meanings), the video collection and kept cards. Body data and song texts stay
   on the device. Merging works record by record: new records come in, of two versions the newer one
   wins, sigil charges are combined, and deletions travel as tombstones so nothing deleted comes back.
   Pure functions on db objects; no DOM. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('../life/model.js'):root.PulseLife);if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseSync=api})(globalThis,function(Life){
 'use strict';
 const FORMAT=1;
 const isObj=v=>v!==null&&typeof v==='object'&&!Array.isArray(v);
 const clone=v=>v===undefined?undefined:JSON.parse(JSON.stringify(v));
 const ts=v=>typeof v==='string'?v:'';
 const isDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
 const KINDS=['life','sigil','video','shelf'];
 const RANK={neu:0,geladen:1,vergessen:2,offen:3,erfuellt:3};
 function ensure(db){if(!isObj(db.sync))db.sync={};if(!isObj(db.sync.gone))db.sync.gone={};return db.sync}
 /* Remembers that a record was deleted here, so a merge removes it elsewhere instead of bringing it back. */
 function forget(db,kind,id,now){if(!KINDS.includes(kind)||!id)return;ensure(db).gone[kind+':'+id]=now}
 /* Undo of a deletion: the record is back, so is its right to travel. */
 function revive(db,kind,ids){const g=ensure(db).gone;for(const id of ids)delete g[kind+':'+id]}
 const goneAt=(db,kind,id)=>ts(ensure(db).gone[kind+':'+id]);
 const version=x=>ts(x&&x.updatedAt)||ts(x&&x.createdAt)||ts(x&&x.addedAt);
 /* What travels: everything that belongs to the shared mind, nothing from the body or the songs. */
 function pack(db,{device='',now=new Date().toISOString(),app=''}={}){
  const life=Life.ensure(db),p=life.preferences||{},d=db.deck||{};
  return {app:'PULSE',kind:'abgleich',format:FORMAT,version:app,exportedAt:now,device:String(device||'').slice(0,40),data:{
   life:{version:1,items:clone(life.items),preferences:{tarot:clone(p.tarot||null),tarotHistory:clone(p.tarotHistory||[]),tarotNotes:clone(p.tarotNotes||{})}},
   magic:clone(isObj(db.magic)?db.magic:{version:1,sigils:[],next:1}),
   videos:clone(isObj(db.videos)?db.videos:{version:1,items:[],shelves:[],next:1}),
   deck:{kept:clone(Array.isArray(d.kept)?d.kept:[])},
   sync:{gone:clone(ensure(db).gone)},
   settings:{name:String((db.settings&&db.settings.name)||'').slice(0,40)}
  }};
 }
 /* Photo ids a package needs (handwritten pages, photos in notes). */
 function photoIds(data){const ids=new Set();for(const x of (isObj(data)&&isObj(data.life)&&Array.isArray(data.life.items)?data.life.items:[]))for(const id of Array.isArray(x&&x.photos)?x.photos:[])if(typeof id==='string'&&/^ph-[a-z0-9]+$/.test(id))ids.add(id);return [...ids]}
 /* A package, or a whole PULSE backup (wrapped or bare). Returns {kind, data, device, exportedAt}. */
 function read(o){
  if(!isObj(o))throw Error('Diese Datei ist kein PULSE-Paket.');
  const data=isObj(o.data)?o.data:o;
  if(!isObj(data.life)&&!isObj(data.magic)&&!isObj(data.videos))throw Error('In dieser Datei steht nichts, was PULSE abgleichen kann.');
  if(o.kind==='abgleich'&&Number(o.format)>FORMAT)throw Error('Dieses Paket stammt aus einer neueren PULSE-Version. Aktualisiere PULSE auf diesem Gerät.');
  return {kind:o.kind==='abgleich'?'abgleich':'backup',data,device:String(o.device||'').slice(0,40),exportedAt:ts(o.exportedAt)};
 }
 function okItem(x){try{Life.validate({version:1,items:[x]});return true}catch(_){return false}}
 /* Merges `src.data` into db. Returns what happened: {life, sigils, tarot, videos, shelves, kept, removed, skipped, photos, name}. */
 function merge(db,src,now=new Date().toISOString()){
  const d=src&&isObj(src.data)?src.data:{},out={life:{added:0,updated:0},sigils:{added:0,updated:0},tarot:{days:0,notes:0,today:false},videos:{added:0,updated:0},shelves:0,kept:0,removed:0,skipped:0,photos:new Set(),name:false};
  /* Tombstones of both sides count. */
  const G=ensure(db).gone,inGone=isObj(d.sync)&&isObj(d.sync.gone)?d.sync.gone:{};
  for(const [k,t] of Object.entries(inGone)){const kind=k.slice(0,k.indexOf(':'));if(typeof t!=='string'||!KINDS.includes(kind))continue;if(!G[k]||G[k]<t)G[k]=t}
  const dead=(kind,x,id)=>{const g=goneAt(db,kind,id);return !!g&&g>=version(x)};
  /* Lebensräume */
  const life=Life.ensure(db),at=new Map(life.items.map((x,i)=>[x.id,i]));
  const items=isObj(d.life)&&Array.isArray(d.life.items)?d.life.items:[];
  for(const x of items){
   if(!isObj(x)||!okItem(x)){out.skipped++;continue}
   if(dead('life',x,x.id))continue;
   const i=at.get(x.id),photos=()=>{for(const p of x.photos||[])out.photos.add(p)};
   if(i==null){life.items.push(clone(x));at.set(x.id,life.items.length-1);out.life.added++;photos()}
   else if(version(x)>version(life.items[i])){life.items[i]=clone(x);out.life.updated++;photos()}
  }
  life.items=life.items.filter(x=>{if(dead('life',x,x.id)){out.removed++;return false}return true});
  /* Tarot: one daily card per day; own meanings are combined, never lost. */
  const P=isObj(life.preferences)?life.preferences:(life.preferences={}),ip=isObj(d.life)&&isObj(d.life.preferences)?d.life.preferences:{};
  if(!Array.isArray(P.tarotHistory))P.tarotHistory=[];
  const days=new Set(P.tarotHistory.map(h=>h&&h.date));
  for(const h of Array.isArray(ip.tarotHistory)?ip.tarotHistory:[]){
   if(!isObj(h)||!isDay(h.date)||!Number.isInteger(h.index)||h.index<0||h.index>77||days.has(h.date))continue;
   P.tarotHistory.push({date:h.date,index:h.index,source:h.source==='deck'?'deck':'digital'});days.add(h.date);out.tarot.days++;
  }
  P.tarotHistory.sort((a,b)=>String(a.date).localeCompare(String(b.date)));P.tarotHistory=P.tarotHistory.slice(-500);
  const it=ip.tarot;if(isObj(it)&&isDay(it.date)&&Number.isInteger(it.index)&&it.index>=0&&it.index<78&&(!isObj(P.tarot)||!isDay(P.tarot.date)||P.tarot.date<it.date)){P.tarot={date:it.date,index:it.index,source:it.source==='deck'?'deck':'digital'};out.tarot.today=true}
  if(!isObj(P.tarotNotes))P.tarotNotes={};
  for(const [k,v] of Object.entries(isObj(ip.tarotNotes)?ip.tarotNotes:{})){
   if(!/^\d+$/.test(k)||Number(k)>77||typeof v!=='string'||!v.trim())continue;
   const cur=typeof P.tarotNotes[k]==='string'?P.tarotNotes[k]:'';
   if(!cur.trim()){P.tarotNotes[k]=v.slice(0,4000);out.tarot.notes++}
   else if(cur!==v&&!cur.includes(v)){P.tarotNotes[k]=(v.includes(cur)?v:cur+'\n\n'+v).slice(0,4000);out.tarot.notes++}
  }
  /* Sigils: charges of both sides, the furthest state, the earliest forgetting, the newest result. */
  if(!isObj(db.magic))db.magic={version:1,sigils:[],next:1};
  const M=db.magic;if(!Array.isArray(M.sigils))M.sigils=[];if(!Number.isInteger(M.next)||M.next<1)M.next=1;
  M.next=Math.max(M.next,...M.sigils.map(s=>(Number(s&&s.no)||0)+1));
  const sigils=isObj(d.magic)&&Array.isArray(d.magic.sigils)?d.magic.sigils:[];
  for(const s of sigils){
   if(!isObj(s)||typeof s.id!=='string'||!s.id||typeof s.letters!=='string'){out.skipped++;continue}
   if(goneAt(db,'sigil',s.id))continue;
   const cur=M.sigils.find(x=>x&&x.id===s.id);
   if(!cur){const c=clone(s);if(!Number.isInteger(c.no)||c.no<1||M.sigils.some(x=>x.no===c.no))c.no=M.next;M.next=Math.max(M.next,c.no+1);M.sigils.push(c);out.sigils.added++;continue}
   let changed=false;if(!Array.isArray(cur.charges))cur.charges=[];
   const seen=new Set(cur.charges.map(c=>c&&c.at));
   for(const c of Array.isArray(s.charges)?s.charges:[])if(isObj(c)&&c.at&&!seen.has(c.at)){cur.charges.push(clone(c));seen.add(c.at);changed=true}
   if(changed)cur.charges.sort((a,b)=>String(a.at).localeCompare(String(b.at)));
   if((RANK[s.status]??0)>(RANK[cur.status]??0)){cur.status=s.status;changed=true}
   if(s.forgottenAt&&(!cur.forgottenAt||String(s.forgottenAt)<String(cur.forgottenAt))){cur.forgottenAt=s.forgottenAt;changed=true}
   if(isObj(s.result)&&s.result.at&&(!isObj(cur.result)||String(s.result.at)>String(cur.result.at||''))){cur.result=clone(s.result);if(s.status==='offen'||s.status==='erfuellt')cur.status=s.status;changed=true}
   if(cur.status==='neu'&&cur.charges.length){cur.status='geladen';changed=true}
   if(changed)out.sigils.updated++;
  }
  M.sigils=M.sigils.filter(s=>{if(s&&goneAt(db,'sigil',s.id)){out.removed++;return false}return true});
  /* Videos: shelves match by id or by name; a collector number already taken here is given anew. */
  if(!isObj(db.videos))db.videos={version:1,items:[],shelves:[],next:1};
  const Vd=db.videos;if(!Array.isArray(Vd.items))Vd.items=[];if(!Array.isArray(Vd.shelves))Vd.shelves=[];
  const iv=isObj(d.videos)?d.videos:{},shelfMap=new Map(),lower=s=>String(s||'').toLocaleLowerCase('de');
  for(const h of Array.isArray(iv.shelves)?iv.shelves:[]){
   if(!isObj(h)||typeof h.id!=='string'||goneAt(db,'shelf',h.id))continue;
   let loc=Vd.shelves.find(x=>x.id===h.id)||Vd.shelves.find(x=>lower(x.name)===lower(h.name));
   if(!loc){loc={id:h.id,name:String(h.name||'Regal').slice(0,40),emoji:String(h.emoji||'').slice(0,4),createdAt:ts(h.createdAt)};Vd.shelves.push(loc);out.shelves++}
   shelfMap.set(h.id,loc.id);
  }
  const vat=new Map(Vd.items.map((x,i)=>[x&&x.id,i])),usedNo=new Set(Vd.items.map(x=>x&&x.no));
  for(const x of Array.isArray(iv.items)?iv.items:[]){
   if(!isObj(x)||typeof x.id!=='string'||!/^(yt|pl)-[A-Za-z0-9_-]+$/.test(x.id)){out.skipped++;continue}
   if(dead('video',x,x.id))continue;
   const c=clone(x);c.shelves=(Array.isArray(c.shelves)?c.shelves:[]).map(id=>shelfMap.get(id)).filter(Boolean);
   const i=vat.get(x.id);
   if(i==null){if(!Number.isInteger(c.no)||c.no<1||usedNo.has(c.no))c.no=0;else usedNo.add(c.no);Vd.items.push(c);vat.set(c.id,Vd.items.length-1);out.videos.added++}
   else{const cur=Vd.items[i];if(version(x)>version(cur)){c.no=cur.no;Vd.items[i]=c;out.videos.updated++}}
  }
  Vd.items=Vd.items.filter(x=>{if(x&&dead('video',x,x.id)){out.removed++;return false}return true});
  Vd.shelves=Vd.shelves.filter(h=>{if(h&&goneAt(db,'shelf',h.id)){out.removed++;return false}return true});
  if(Vd.items.some(x=>x&&x.no===0)){let n=Vd.items.reduce((m,x)=>Math.max(m,Number(x&&x.no)||0),0)+1;for(const x of [...Vd.items].sort((a,b)=>ts(a.addedAt).localeCompare(ts(b.addedAt))))if(x.no===0)x.no=n++;Vd.next=Math.max(Number(Vd.next)||1,n)}
  /* Kept cards of the Stapel. */
  if(!isObj(db.deck))db.deck={};
  const D=db.deck;if(!Array.isArray(D.kept))D.kept=[];
  const refs=new Set(D.kept.map(k=>k&&k.ref)),nos=new Set(D.kept.map(k=>k&&k.no));let kn=Math.max(Number(D.next)||1,...D.kept.map(k=>(Number(k&&k.no)||0)+1));
  for(const k of isObj(d.deck)&&Array.isArray(d.deck.kept)?d.deck.kept:[]){
   if(!isObj(k)||typeof k.ref!=='string'||refs.has(k.ref))continue;
   const c=clone(k);if(!Number.isInteger(c.no)||c.no<1||nos.has(c.no))c.no=kn;kn=Math.max(kn,c.no+1);D.kept.push(c);refs.add(c.ref);nos.add(c.no);out.kept++;
  }
  D.next=kn;
  /* The name for the greeting, if this device has none yet. */
  const nm=isObj(d.settings)?String(d.settings.name||'').trim().slice(0,40):'';
  if(nm){if(!isObj(db.settings))db.settings={};if(!String(db.settings.name||'').trim()){db.settings.name=nm;out.name=true}}
  out.photos=[...out.photos];
  return out;
 }
 /* Same as merge, on a copy: what a merge would do. */
 function preview(db,src,now){return merge(clone(db),src,now)}
 const changes=r=>r.life.added+r.life.updated+r.sigils.added+r.sigils.updated+r.tarot.days+r.tarot.notes+(r.tarot.today?1:0)+r.videos.added+r.videos.updated+r.shelves+r.kept+r.removed+(r.name?1:0);
 return {FORMAT,ensure,forget,revive,pack,photoIds,read,merge,preview,changes};
});
