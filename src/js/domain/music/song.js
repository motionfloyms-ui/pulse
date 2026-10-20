// SOURCE: domain/music/song.js
/* Song workshop: songs with lyrics, a line-by-line vocal map (dynamics, colour, breath, emphasis,
   notes), takes, reference videos and warm-ups. Stored in db.songs; pure functions, no DOM. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseSong=api})(globalThis,function(){
 'use strict';
 const STATUS=[['idee','Idee'],['text','Text'],['proben','Proben'],['aufgenommen','Aufgenommen'],['fertig','Fertig']];
 const DYN=[['leise','leise'],['normal','normal'],['voll','voll'],['belt','Belt'],['scream','Scream'],['growl','Growl']];
 const COLOR=[['klar','klar'],['hauchig','hauchig'],['rau','rau'],['kopf','Kopfstimme'],['fry','Fry']];
 const DYN_IDS=DYN.map(d=>d[0]),COLOR_IDS=COLOR.map(c=>c[0]),STATUS_IDS=STATUS.map(s=>s[0]);
 const clean=s=>String(s||'').replace(/\s+/g,' ').trim();
 /* Lyrics → sections of lines. Each line gets a stable key: its text plus the occurrence number,
    so repeated choruses can be sung differently and inserting lines keeps other notes in place. */
 function parse(lyrics){
  const seen={},sections=[];let cur=[];
  for(const raw of String(lyrics||'').replace(/\r/g,'').split('\n')){
   const text=raw.trim();
   if(!text){if(cur.length){sections.push(cur);cur=[]}continue}
   if(/^\[.*\]$/.test(text)){if(cur.length){sections.push(cur);cur=[]}cur.label=text.slice(1,-1).trim();continue}
   const base=clean(text).toLocaleLowerCase('de');seen[base]=(seen[base]||0)+1;
   const parts=text.split('/').map(clean);
   cur.push({text:parts.join(' '),key:base+'#'+seen[base],breaths:parts.slice(0,-1).map((p,i)=>parts.slice(0,i+1).join(' ').split(/\s+/).filter(Boolean).length),words:parts.join(' ').split(/\s+/).filter(Boolean)});
  }
  if(cur.length)sections.push(cur);
  return sections;
 }
 function ensure(db){if(!db.songs||typeof db.songs!=='object'||Array.isArray(db.songs))db.songs={version:1,items:[],next:1,warmups:[]};const s=db.songs;if(!Array.isArray(s.items))s.items=[];if(!Array.isArray(s.warmups))s.warmups=[];if(!Number.isInteger(s.next)||s.next<1)s.next=s.items.reduce((a,x)=>Math.max(a,Number(x&&x.no)||0),0)+1;return s}
 function cleanNote(n){if(!n||typeof n!=='object')return null;const o={};if(DYN_IDS.includes(n.dyn))o.dyn=n.dyn;if(COLOR_IDS.includes(n.color))o.color=n.color;if(n.breath)o.breath=true;if(Array.isArray(n.emph)){const e=[...new Set(n.emph.map(Number).filter(i=>Number.isInteger(i)&&i>=0&&i<200))].sort((a,b)=>a-b);if(e.length)o.emph=e}const t=String(n.note||'').slice(0,300).trim();if(t)o.note=t;return Object.keys(o).length?o:null}
 function normalize(db){
  const s=ensure(db),ids=new Set();
  s.items=s.items.filter(x=>x&&typeof x.id==='string'&&!ids.has(x.id)&&ids.add(x.id)).map(x=>{const notes={};for(const [k,v] of Object.entries(x.notes&&typeof x.notes==='object'?x.notes:{})){const c=cleanNote(v);if(c)notes[String(k).slice(0,300)]=c}
   return {id:x.id,no:Number(x.no)||0,title:clean(x.title).slice(0,120)||'Ohne Titel',status:STATUS_IDS.includes(x.status)?x.status:'idee',lyrics:String(x.lyrics||'').slice(0,40000),notes,bpm:Math.max(0,Math.min(300,Math.round(Number(x.bpm)||0))),key:clean(x.key).slice(0,20),
    refs:Array.isArray(x.refs)?[...new Set(x.refs.filter(r=>typeof r==='string'))].slice(0,50):[],takes:Array.isArray(x.takes)?x.takes.filter(t=>t&&t.at).map(t=>({at:String(t.at),rating:Math.max(0,Math.min(5,Math.round(Number(t.rating)||0))),note:String(t.note||'').slice(0,2000)})):[],createdAt:String(x.createdAt||''),updatedAt:String(x.updatedAt||x.createdAt||'')}});
  let next=s.items.reduce((a,x)=>Math.max(a,x.no),0)+1;for(const x of s.items)if(!x.no)x.no=next++;s.next=Math.max(s.next,next);
  s.warmups=s.warmups.filter(w=>typeof w==='string'&&/^\d{4}-\d{2}-\d{2}/.test(w)).slice(-1000);return s;
 }
 function create(db,{title,lyrics=''},now,id){const s=ensure(db),t=clean(title);if(!t)throw Error('Wie heißt der Song?');const x={id:id||'song-'+Date.now().toString(36),no:s.next++,title:t.slice(0,120),status:lyrics.trim()?'text':'idee',lyrics:String(lyrics).slice(0,40000),notes:{},bpm:0,key:'',refs:[],takes:[],createdAt:now,updatedAt:now};s.items.push(x);return x}
 const get=(db,id)=>ensure(db).items.find(x=>x.id===id)||null;
 const need=(db,id)=>{const x=get(db,id);if(!x)throw Error('Diesen Song gibt es nicht mehr.');return x};
 function update(db,id,fields,now){const x=need(db,id);if('title' in fields){const t=clean(fields.title);if(!t)throw Error('Der Titel fehlt.');x.title=t.slice(0,120)}if('status' in fields&&STATUS_IDS.includes(fields.status))x.status=fields.status;if('lyrics' in fields)x.lyrics=String(fields.lyrics||'').slice(0,40000);if('bpm' in fields)x.bpm=Math.max(0,Math.min(300,Math.round(Number(fields.bpm)||0)));if('key' in fields)x.key=clean(fields.key).slice(0,20);x.updatedAt=now;return x}
 /* Changes one line's notes; fields are merged, `null` removes a field. */
 function annotate(db,id,lineKey,fields,now){const x=need(db,id),cur={...(x.notes[lineKey]||{})};for(const [k,v] of Object.entries(fields)){if(v==null||v===false||v==='')delete cur[k];else cur[k]=v}const c=cleanNote(cur);if(c)x.notes[lineKey]=c;else delete x.notes[lineKey];x.updatedAt=now;return x}
 function toggleEmphasis(db,id,lineKey,word,now){const n=get(db,id)?.notes[lineKey]||{},e=new Set(n.emph||[]);if(e.has(word))e.delete(word);else e.add(word);return annotate(db,id,lineKey,{emph:e.size?[...e]:null},now)}
 function addTake(db,id,{rating=0,note=''},now){const x=need(db,id);x.takes.push({at:now,rating:Math.max(0,Math.min(5,Math.round(Number(rating)||0))),note:String(note||'').slice(0,2000)});if(['idee','text'].includes(x.status))x.status='proben';x.updatedAt=now;return x}
 function removeTake(db,id,at,now){const x=need(db,id);x.takes=x.takes.filter(t=>t.at!==at);x.updatedAt=now;return x}
 function link(db,id,ref,on,now){const x=need(db,id);x.refs=on?[...new Set([...x.refs,ref])]:x.refs.filter(r=>r!==ref);x.updatedAt=now;return x}
 function remove(db,id){const s=ensure(db);s.items=s.items.filter(x=>x.id!==id)}
 function warmup(db,date){const s=ensure(db);s.warmups.push(date);return s.warmups.length}
 /* Counts for the vocal map: how many lines exist and how many carry a decision. */
 function coverage(song){const lines=parse(song.lyrics).flat(),done=lines.filter(l=>song.notes[l.key]).length;return {lines:lines.length,done}}
 /* Plain-text vocal map for printing or sharing. */
 const DYN_L=Object.fromEntries(DYN),COLOR_L=Object.fromEntries(COLOR);
 function sheet(song){
  const out=[song.title+(song.key||song.bpm?' ('+[song.key,song.bpm?song.bpm+' BPM':''].filter(Boolean).join(', ')+')':''),''];
  for(const sec of parse(song.lyrics)){if(sec.label)out.push('['+sec.label+']');for(const l of sec){const n=song.notes[l.key]||{};const words=l.words.map((w,i)=>(n.emph||[]).includes(i)?w.toLocaleUpperCase('de'):w);for(const b of [...l.breaths].reverse())words.splice(b,0,'/');const tags=[n.dyn&&DYN_L[n.dyn],n.color&&COLOR_L[n.color]].filter(Boolean).join(', ');out.push((n.breath?'◡ ':'')+words.join(' ')+(tags?'   ['+tags+']':'')+(n.note?'   – '+n.note:''))}out.push('')}
  return out.join('\n').trim()+'\n';
 }
 return {STATUS,DYN,COLOR,parse,ensure,normalize,create,get,update,annotate,toggleEmphasis,addTake,removeTake,link,remove,warmup,coverage,sheet};
});
