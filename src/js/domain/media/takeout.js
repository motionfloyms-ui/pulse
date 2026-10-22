// SOURCE: domain/media/takeout.js
/* Reads a Google Takeout export of YouTube playlists: the ZIP itself (no unpacking needed) or the
   CSV files from it. Knows the current format ("Video ID, Playlist Video Creation Timestamp", one file
   per playlist plus playlists.csv) and the older one (playlist info block, blank line, video list),
   in German and English. Returns plain lists; putting them into the collection is PulseVault's job. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseTakeout=api})(globalThis,function(){
 'use strict';
 const ID=/^[A-Za-z0-9_-]{11}$/;
 const u16=(b,o)=>b[o]|b[o+1]<<8,u32=(b,o)=>(b[o]|b[o+1]<<8|b[o+2]<<16|b[o+3]<<24)>>>0;
 const u64=(b,o)=>u32(b,o)+u32(b,o+4)*4294967296;
 const fail=m=>{const e=new Error(m);e.code='TAKEOUT';throw e};
 /* The files of a ZIP as [{name, bytes}]. `inflate(bytes)` returns a Promise of the raw-deflated data;
    `want(name)` picks the entries to unpack. */
 async function unzip(input,{inflate,want=()=>true}={}){
  const b=input instanceof Uint8Array?input:new Uint8Array(input);
  let eocd=-1;for(let i=b.length-22;i>=Math.max(0,b.length-65557);i--)if(u32(b,i)===0x06054b50){eocd=i;break}
  if(eocd<0)fail('Das ist keine ZIP-Datei, oder sie ist unvollständig heruntergeladen.');
  let count=u16(b,eocd+10),size=u32(b,eocd+12),offset=u32(b,eocd+16);
  if(count===0xffff||size===0xffffffff||offset===0xffffffff){
   const loc=eocd-20;if(loc<0||u32(b,loc)!==0x07064b50)fail('Diese ZIP-Datei kann PULSE nicht lesen.');
   const z=u64(b,loc+8);if(u32(b,z)!==0x06064b50)fail('Diese ZIP-Datei kann PULSE nicht lesen.');
   count=u64(b,z+32);size=u64(b,z+40);offset=u64(b,z+48);
  }
  const dec=new TextDecoder('utf-8'),out=[];let p=offset;
  for(let n=0;n<count;n++){
   if(u32(b,p)!==0x02014b50)fail('Das Inhaltsverzeichnis der ZIP-Datei ist beschädigt.');
   const method=u16(b,p+10),nameLen=u16(b,p+28),extraLen=u16(b,p+30),commentLen=u16(b,p+32);
   let csize=u32(b,p+20),usize=u32(b,p+24),local=u32(b,p+42);
   const name=dec.decode(b.subarray(p+46,p+46+nameLen));
   // ZIP64 sizes and offsets live in the extra field (id 0x0001), in this order, only where 0xFFFFFFFF.
   for(let e=p+46+nameLen,end=e+extraLen;e+4<=end;){const id=u16(b,e),len=u16(b,e+2);if(id===1){let q=e+4;if(usize===0xffffffff){usize=u64(b,q);q+=8}if(csize===0xffffffff){csize=u64(b,q);q+=8}if(local===0xffffffff){local=u64(b,q)}}e+=4+len}
   p+=46+nameLen+extraLen+commentLen;
   if(name.endsWith('/')||!want(name))continue;
   if(u32(b,local)!==0x04034b50)fail('Ein Eintrag in der ZIP-Datei ist beschädigt.');
   const start=local+30+u16(b,local+26)+u16(b,local+28),raw=b.subarray(start,start+csize);
   if(method===0)out.push({name,bytes:raw});
   else if(method===8){if(!inflate)fail('Entpacken wird hier nicht unterstützt.');out.push({name,bytes:await inflate(raw)})}
   else fail('Die ZIP-Datei nutzt eine Kompression, die PULSE nicht kennt.');
  }
  return out;
 }
 /* RFC 4180 CSV: quotes, doubled quotes, line breaks inside quotes, BOM, CRLF. */
 function csv(text){
  const s=String(text||'').replace(/^﻿/,''),rows=[];let row=[],cell='',q=false;
  for(let i=0;i<s.length;i++){
   const c=s[i];
   if(q){if(c==='"'){if(s[i+1]==='"'){cell+='"';i++}else q=false}else cell+=c;continue}
   if(c==='"')q=true;else if(c===','){row.push(cell);cell=''}else if(c==='\n'||c==='\r'){if(c==='\r'&&s[i+1]==='\n')i++;row.push(cell);rows.push(row);row=[];cell=''}else cell+=c;
  }
  if(cell!==''||row.length){row.push(cell);rows.push(row)}
  return rows;
 }
 /* "2023-04-05T10:11:12+00:00", "2019-02-03 10:00:00 UTC" → ISO, or '' */
 function when(v){
  const t=String(v||'').trim();if(!t)return '';
  const x=Date.parse(t.replace(/ UTC$/,'Z').replace(/^(\d{4}-\d{2}-\d{2}) (\d)/,'$1T$2'));
  return Number.isFinite(x)?new Date(x).toISOString():'';
 }
 const base=n=>n.split('/').pop();
 const key=s=>String(s||'').toLocaleLowerCase('de').replace(/[^\p{L}\p{N}]+/gu,'');
 /* One CSV file → {title, playlistId, videos:[{vid, at}]} or null when it holds no videos. */
 function readList(name,text){
  const rows=csv(text);let head=-1,idCol=-1,atCol=-1,title='',playlistId='';
  for(let r=0;r<rows.length;r++){
   const row=rows[r].map(c=>c.trim()),low=row.map(c=>c.toLowerCase());
   const v=low.findIndex(c=>/video/.test(c)&&/id/.test(c)&&!/playlist|kanal|channel/.test(c));
   if(v>=0){head=r;idCol=v;atCol=low.findIndex((c,i)=>i!==v&&/(zeit|time|datum|date|hinzu|added|erstell|creat)/.test(c));break}
   // Older exports start with a block about the playlist itself.
   const ti=low.findIndex(c=>/^(titel|title)$/.test(c));
   if(ti>=0&&rows[r+1]){title=(rows[r+1][ti]||'').trim();const pi=low.findIndex(c=>/playlist.?id/.test(c));if(pi>=0)playlistId=(rows[r+1][pi]||'').trim()}
  }
  if(head<0)return null;
  const videos=[];
  for(let r=head+1;r<rows.length;r++){const vid=(rows[r][idCol]||'').trim();if(ID.test(vid))videos.push({vid,at:atCol>=0?when(rows[r][atCol]):''})}
  if(!videos.length)return null;
  const file=base(name).replace(/\.csv$/i,'').replace(/[-_ ](videos)$/i,'').trim();
  return {title:title||file,file,playlistId,videos};
 }
 /* The overview playlists.csv: maps a cleaned title to the original one (file names lose characters). */
 function readOverview(text){
  const rows=csv(text);if(!rows.length)return null;const low=rows[0].map(c=>c.trim().toLowerCase());
  const ti=low.findIndex(c=>/(title|titel)/.test(c)&&/(original)/.test(c)),t2=ti>=0?ti:low.findIndex(c=>/^(playlist[- ]?)?(title|titel)$/.test(c)||/playlist-?titel|playlist title/.test(c));
  const pid=low.findIndex(c=>/playlist[- ]?id/.test(c));if(t2<0||pid<0)return null;
  return rows.slice(1).map(r=>({id:(r[pid]||'').trim(),title:(r[t2]||'').trim()})).filter(x=>x.title);
 }
 const WATCH_LATER=/^(watch later|später ansehen|spaeter ansehen)$/i;
 /* All playlists from a set of files [{name, text}]. Same-named lists are merged; videos stay in the
    order of the export; duplicates inside one list are dropped. */
 function lists(files){
  const overview=[],found=[];
  for(const f of files){
   if(!/\.csv$/i.test(f.name))continue;
   if(/^playlists?\.csv$/i.test(base(f.name))){const o=readOverview(f.text);if(o){overview.push(...o);continue}}
   const l=readList(f.name,f.text);if(l)found.push(l);
  }
  const titles=new Map(overview.map(o=>[key(o.title),o.title]));
  const merged=new Map();
  for(const l of found){
   let title=titles.get(key(l.title))||l.title;
   if(WATCH_LATER.test(title.trim()))title='Später ansehen';
   const k=key(title)||key(l.file);if(!merged.has(k))merged.set(k,{title,videos:[],seen:new Set()});
   const m=merged.get(k);for(const v of l.videos)if(!m.seen.has(v.vid)){m.seen.add(v.vid);m.videos.push(v)}
  }
  return [...merged.values()].map(({title,videos})=>({title,videos}));
 }
 /* From the raw bytes of the chosen files (ZIP or CSV) to playlists. */
 async function read(inputs,{inflate}={}){
  const dec=new TextDecoder('utf-8'),files=[];
  for(const f of inputs){
   const bytes=f.bytes instanceof Uint8Array?f.bytes:new Uint8Array(f.bytes);
   if(bytes[0]===0x50&&bytes[1]===0x4b){for(const e of await unzip(bytes,{inflate,want:n=>/\.csv$/i.test(n)}))files.push({name:e.name,text:dec.decode(e.bytes)})}
   else files.push({name:f.name||'liste.csv',text:dec.decode(bytes)});
  }
  const out=lists(files);
  if(!out.length)fail(files.length?'In der Datei stecken keine YouTube-Playlists. Beim Takeout „Playlists“ angehakt?':'In der ZIP-Datei sind keine Tabellen (CSV). Ist es der YouTube-Export aus Google Takeout?');
  return out;
 }
 return {unzip,csv,when,readList,readOverview,lists,read,ID};
});
