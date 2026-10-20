// SOURCE: domain/media/vault.js
/* The video collection: every YouTube video once, with a collector number, shelves, status,
   favourites, notes and marked moments. Stored in db.videos; no DOM. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./video.js'):root.PulseVideo);if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseVault=api})(globalThis,function(Video){
 'use strict';
 const MILESTONES=[1,10,25,50,100,150,200,250,300,400,500,750,1000,1500,2000];
 const ROOMS=['alltag','innen','sinn','koerper','menschen','ideen','draussen','zuhause'];
 const str=(v,n)=>String(v==null?'':v).replace(/\s+/g,' ').trim().slice(0,n);
 function ensure(db){
  if(!db.videos||typeof db.videos!=='object'||Array.isArray(db.videos))db.videos={version:1,items:[],shelves:[],next:1};
  const s=db.videos;if(!Array.isArray(s.items))s.items=[];if(!Array.isArray(s.shelves))s.shelves=[];
  if(!Number.isInteger(s.next)||s.next<1)s.next=s.items.reduce((m,x)=>Math.max(m,Number(x&&x.no)||0),0)+1;
  return s;
 }
 /* Repairs whatever an old backup or a hand-edited file might contain. */
 function normalize(db){
  const s=ensure(db),seen=new Set(),shelfIds=new Set();
  s.shelves=s.shelves.filter(h=>h&&typeof h.id==='string'&&!shelfIds.has(h.id)&&shelfIds.add(h.id)).map(h=>({id:h.id,name:str(h.name,40)||'Regal',emoji:str(h.emoji,4),createdAt:String(h.createdAt||'')}));
  const keyOf=x=>x&&(x.kind==='playlist'?(typeof x.list==='string'&&/^[A-Za-z0-9_-]{10,64}$/.test(x.list)?'pl-'+x.list:''):(typeof x.vid==='string'&&/^[A-Za-z0-9_-]{11}$/.test(x.vid)?'yt-'+x.vid:''));
  s.items=s.items.filter(x=>{const k=keyOf(x);return k&&!seen.has(k)&&seen.add(k)}).map(x=>({
   id:keyOf(x),kind:x.kind==='playlist'?'playlist':'video',vid:x.kind==='playlist'?'':x.vid,list:x.kind==='playlist'?x.list:'',thumb:/^https:\/\/i\d?\.ytimg\.com\/\S+$/.test(x.thumb||'')?x.thumb:'',no:Number.isInteger(x.no)&&x.no>0?x.no:0,start:Math.max(0,Number(x.start)||0),short:!!x.short,
   title:str(x.title,200),channel:str(x.channel,100),room:ROOMS.includes(x.room)?x.room:'',
   shelves:Array.isArray(x.shelves)?[...new Set(x.shelves.filter(id=>shelfIds.has(id)))]:[],
   status:x.status==='gesehen'?'gesehen':'neu',fav:!!x.fav,seen:Math.max(0,Math.floor(Number(x.seen)||0)),seenAt:String(x.seenAt||''),
   note:String(x.note||'').slice(0,20000),marks:Array.isArray(x.marks)?x.marks.filter(m=>m&&Number.isFinite(m.t)).map(m=>({t:Math.max(0,Math.floor(m.t)),text:str(m.text,200)})).sort((a,b)=>a.t-b.t).slice(0,200):[],
   addedAt:String(x.addedAt||''),updatedAt:String(x.updatedAt||x.addedAt||'')}));
  let next=s.items.reduce((m,x)=>Math.max(m,x.no),0)+1;for(const x of [...s.items].sort((a,b)=>a.addedAt.localeCompare(b.addedAt)))if(!x.no)x.no=next++;
  s.next=Math.max(s.next||1,next);return s;
 }
 const get=(db,id)=>ensure(db).items.find(x=>x.id===id||(x.vid&&x.vid===id))||null;
 /* Adds a video. Returns {item, duplicate}. A duplicate is never added twice. */
 function add(db,{url,title='',channel='',room='',shelves=[],note=''},now){
  const v=Video.parseAny(url);if(!v)throw Error('Das ist kein YouTube-Link zu einem Video oder einer Playlist.');
  const key=v.type==='playlist'?'pl-'+v.list:'yt-'+v.id;
  const s=ensure(db),old=s.items.find(x=>x.id===key);if(old)return {item:old,duplicate:true};
  const ids=new Set(s.shelves.map(h=>h.id));
  const item={id:key,kind:v.type,vid:v.type==='video'?v.id:'',list:v.type==='playlist'?v.list:'',thumb:'',no:s.next++,start:v.start||0,short:!!v.short,title:str(title,200),channel:str(channel,100),room:ROOMS.includes(room)?room:'',
   shelves:[...new Set(shelves.filter(id=>ids.has(id)))],status:'neu',fav:false,seen:0,seenAt:'',note:String(note||'').slice(0,20000),marks:[],addedAt:now,updatedAt:now};
  s.items.push(item);return {item,duplicate:false};
 }
 function need(db,id){const x=get(db,id);if(!x)throw Error('Dieses Video ist nicht mehr in der Sammlung.');return x}
 function update(db,id,fields,now){
  const x=need(db,id);
  if('title' in fields)x.title=str(fields.title,200);
  if('channel' in fields)x.channel=str(fields.channel,100);
  if('thumb' in fields)x.thumb=/^https:\/\/i\d?\.ytimg\.com\/\S+$/.test(fields.thumb||'')?fields.thumb:'';
  if('room' in fields)x.room=ROOMS.includes(fields.room)?fields.room:'';
  if('note' in fields)x.note=String(fields.note||'').slice(0,20000);
  if('fav' in fields)x.fav=!!fields.fav;
  if('status' in fields)x.status=fields.status==='gesehen'?'gesehen':'neu';
  x.updatedAt=now;return x;
 }
 function watched(db,id,now){const x=need(db,id);x.status='gesehen';x.seen=(x.seen||0)+1;x.seenAt=now;x.updatedAt=now;return x}
 function remove(db,id){const s=ensure(db),i=s.items.findIndex(x=>x.id===id||x.vid===id);if(i<0)throw Error('Dieses Video ist nicht mehr in der Sammlung.');return s.items.splice(i,1)[0]}
 function addShelf(db,name,emoji,now,id){
  const s=ensure(db),n=str(name,40);if(!n)throw Error('Wie soll das Regal heißen?');
  if(s.shelves.some(h=>h.name.toLocaleLowerCase('de')===n.toLocaleLowerCase('de')))throw Error('Ein Regal mit diesem Namen gibt es schon.');
  const h={id:id||'sh-'+Date.now().toString(36),name:n,emoji:str(emoji,4),createdAt:now};s.shelves.push(h);return h;
 }
 function renameShelf(db,id,name,emoji){const h=ensure(db).shelves.find(x=>x.id===id);if(!h)throw Error('Regal nicht gefunden.');const n=str(name,40);if(!n)throw Error('Wie soll das Regal heißen?');h.name=n;if(emoji!=null)h.emoji=str(emoji,4);return h}
 function removeShelf(db,id){const s=ensure(db);s.shelves=s.shelves.filter(h=>h.id!==id);for(const x of s.items)x.shelves=x.shelves.filter(i=>i!==id)}
 function setShelf(db,id,shelf,on,now){const x=need(db,id);if(!ensure(db).shelves.some(h=>h.id===shelf))throw Error('Regal nicht gefunden.');x.shelves=on?[...new Set([...x.shelves,shelf])]:x.shelves.filter(i=>i!==shelf);x.updatedAt=now;return x}
 /* "1:23", "1:02:03", "83", "1m30s" → seconds, or null */
 function parseTime(t){t=String(t||'').trim().replace(',',':').replace('.',':');if(!t)return null;if(/^\d+(:\d{1,2}){0,2}$/.test(t)){const p=t.split(':').map(Number);if(p.slice(1).some(n=>n>59))return null;return p.reduce((a,b)=>a*60+b,0)}const s=Video.seconds(t.toLowerCase());return s||null}
 function fmtTime(sec){sec=Math.max(0,Math.floor(sec));const h=Math.floor(sec/3600),m=Math.floor(sec%3600/60),s=String(sec%60).padStart(2,'0');return h?h+':'+String(m).padStart(2,'0')+':'+s:m+':'+s}
 function addMark(db,id,time,text,now){const x=need(db,id),t=parseTime(time);if(t==null)throw Error('Zeit bitte als 1:23 angeben.');x.marks=[...x.marks.filter(m=>m.t!==t),{t,text:str(text,200)}].sort((a,b)=>a.t-b.t);x.updatedAt=now;return x}
 function removeMark(db,id,t,now){const x=need(db,id);x.marks=x.marks.filter(m=>m.t!==t);x.updatedAt=now;return x}
 const norm=s=>String(s||'').toLocaleLowerCase('de');
 /* filter: all | neu | gesehen | fav;  sort: neu | alt | titel | kanal | nummer */
 function query(db,{filter='all',shelf='',room='',channel='',q='',sort='neu'}={}){
  let list=ensure(db).items.slice();
  if(filter==='neu'||filter==='gesehen')list=list.filter(x=>x.status===filter);else if(filter==='fav')list=list.filter(x=>x.fav);else if(filter==='playlist')list=list.filter(x=>x.kind==='playlist');
  if(shelf==='none')list=list.filter(x=>!x.shelves.length);else if(shelf)list=list.filter(x=>x.shelves.includes(shelf));
  if(room==='none')list=list.filter(x=>!x.room);else if(room)list=list.filter(x=>x.room===room);
  if(channel)list=list.filter(x=>x.channel===channel);
  const t=norm(q).trim();if(t){const names=Object.fromEntries(ensure(db).shelves.map(h=>[h.id,h.name]));list=list.filter(x=>norm([x.title,x.channel,x.note,'#'+x.no,...x.marks.map(m=>m.text),...x.shelves.map(i=>names[i])].join(' ')).includes(t))}
  const by={neu:(a,b)=>b.addedAt.localeCompare(a.addedAt)||b.no-a.no,alt:(a,b)=>a.addedAt.localeCompare(b.addedAt)||a.no-b.no,nummer:(a,b)=>a.no-b.no,titel:(a,b)=>norm(a.title||'~').localeCompare(norm(b.title||'~'),'de'),kanal:(a,b)=>norm(a.channel||'~').localeCompare(norm(b.channel||'~'),'de')||b.no-a.no}[sort]||((a,b)=>b.no-a.no);
  return list.sort(by);
 }
 function count(list){return {total:list.length,playlists:list.filter(x=>x.kind==='playlist').length,seen:list.filter(x=>x.status==='gesehen').length,fav:list.filter(x=>x.fav).length}}
 function milestone(total){const prev=[...MILESTONES].reverse().find(m=>m<=total)||0,next=MILESTONES.find(m=>m>total)||null;return {prev,next,left:next?next-total:0}}
 function stats(db){
  const s=ensure(db),c=count(s.items),channels=new Set(s.items.map(x=>x.channel).filter(Boolean));
  const first=s.items.reduce((m,x)=>!m||x.addedAt<m?x.addedAt:m,'');
  return {...c,shelves:s.shelves.length,channels:channels.size,marks:s.items.reduce((a,x)=>a+x.marks.length,0),first,...milestone(c.total)};
 }
 const reached=(before,after)=>MILESTONES.find(m=>before<m&&after>=m)||null;
 function groups(db,by){
  const s=ensure(db);
  if(by==='shelf')return [...s.shelves.map(h=>({key:h.id,name:h.name,emoji:h.emoji,items:s.items.filter(x=>x.shelves.includes(h.id))})),{key:'none',name:'Ohne Regal',emoji:'',items:s.items.filter(x=>!x.shelves.length)}].filter(g=>g.key!=='none'||g.items.length);
  if(by==='room')return [...ROOMS.map(r=>({key:r,items:s.items.filter(x=>x.room===r)})),{key:'none',items:s.items.filter(x=>!x.room)}].filter(g=>g.items.length);
  if(by==='channel'){const m=new Map();for(const x of s.items){const k=x.channel||'';if(!m.has(k))m.set(k,[]);m.get(k).push(x)}return [...m].map(([key,items])=>({key,name:key||'Kanal unbekannt',items})).sort((a,b)=>(!a.key)-(!b.key)||b.items.length-a.items.length||a.name.localeCompare(b.name,'de'))}
  return [];
 }
 function random(db,filter='neu',pick=Math.random){const list=query(db,{filter});return list.length?list[Math.floor(pick()*list.length)]:null}
 /* One-time move of YouTube notes from the rooms into the collection. Returns the number moved. */
 function adoptFromLife(db,now){
  const life=db.life?.items;if(!Array.isArray(life))return 0;
  const take=life.filter(x=>x&&x.kind==='note'&&x.url&&Video.parseAny(x.url));
  for(const x of take){
   const generic=/^(youtube-video|link|geteilt)$/i.test(x.title||'');
   const r=add(db,{url:x.url,title:generic?'':x.title,room:x.room,note:x.body},x.createdAt||now);
   if(r.duplicate&&x.body&&!r.item.note.includes(x.body))r.item.note=(r.item.note?r.item.note+'\n\n':'')+x.body;
  }
  if(take.length)db.life.items=life.filter(x=>!take.includes(x));
  return take.length;
 }
 return {MILESTONES,ensure,normalize,get,add,update,watched,remove,addShelf,renameShelf,removeShelf,setShelf,parseTime,fmtTime,addMark,removeMark,query,count,stats,milestone,reached,groups,random,adoptFromLife};
});
