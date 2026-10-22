// SOURCE: domain/content/deck.js
/* The daily stack ("Stapel"): a fixed number of cards per day instead of an endless feed. It mixes the
   written cards, videos from the person's own collection, one tarot card to study, one old note of
   their own and today's sky. Everything shown is remembered, so nothing comes back too soon.
   Pure functions on db.deck; the same day always gives the same stack. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseDeck=api})(globalThis,function(){
 'use strict';
 const TOPICS=['geist','kosmos','magie','stimme','kunst','schreiben'];
 const SIZES=[8,12,16,20];
 const VIDEO_GAP=45,OWN_GAP=120,OWN_AGE=21,FAV_GAP=120;
 function hash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return h>>>0}
 function rng(s){let a=hash(s);return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 const shuffle=(list,r)=>{const a=list.slice();for(let i=a.length-1;i>0;i--){const j=Math.floor(r()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
 const days=(a,b)=>Math.round((Date.parse(b+'T12:00:00Z')-Date.parse(a+'T12:00:00Z'))/86400000);
 const isDay=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s);
 function ensure(db){
  if(!db.deck||typeof db.deck!=='object'||Array.isArray(db.deck))db.deck={};
  const d=db.deck;
  if(!isDay(d.day))d.day='';
  if(!Array.isArray(d.cards))d.cards=[];d.cards=d.cards.filter(c=>c&&typeof c.type==='string'&&typeof c.ref==='string');
  if(!Number.isInteger(d.pos)||d.pos<0)d.pos=0;if(d.pos>d.cards.length)d.pos=d.cards.length;
  if(!Number.isInteger(d.reached)||d.reached<0)d.reached=0;
  if(!d.seen||typeof d.seen!=='object'||Array.isArray(d.seen))d.seen={};
  if(!Array.isArray(d.kept))d.kept=[];d.kept=d.kept.filter(k=>k&&typeof k.ref==='string');
  if(!Number.isInteger(d.next)||d.next<1)d.next=d.kept.reduce((m,k)=>Math.max(m,Number(k.no)||0),0)+1;
  if(!Array.isArray(d.topics))d.topics=TOPICS.slice();d.topics=TOPICS.filter(t=>d.topics.includes(t));if(!d.topics.length)d.topics=TOPICS.slice();
  if(!SIZES.includes(d.size))d.size=12;
  if(!Array.isArray(d.log))d.log=[];
  if(!d.stats||typeof d.stats!=='object')d.stats={kept:0,watched:0};
  if(typeof d.web!=='boolean')d.web=true;
  if(!d.webCache||typeof d.webCache!=='object'||Array.isArray(d.webCache))d.webCache={};
  return d;
 }
 /* The stack for `day`. Sources: `cards` [{id, topic}], `videos` (collection items), `own` [{id, createdAt}],
    `tarot` (number of tarot cards, 0 = none). `seen` maps refs to the day they were last shown. */
 function build({day,size=12,topics=TOPICS,cards=[],videos=[],own=[],tarot=0,web=[],seen={},kept=[]}){
  const r=rng('stapel:'+day),last=ref=>isDay(seen[ref])?seen[ref]:'',gap=ref=>last(ref)?days(last(ref),day):Infinity;
  // Own videos: never watched first, spread over the shelves; favourites come back after a while.
  const pool=shuffle(videos.filter(v=>v&&v.kind!=='playlist'&&v.vid&&gap('v:'+v.vid)>=VIDEO_GAP),r);
  const want=pool.length?Math.min(size>=16?5:size>=12?4:3,pool.length):0;
  const queues=new Map();for(const v of pool.filter(v=>v.status!=='gesehen')){const k=(v.shelves&&v.shelves[0])||'';if(!queues.has(k))queues.set(k,[]);queues.get(k).push(v)}
  const qs=shuffle([...queues.values()],r),vids=[];
  while(vids.length<want&&qs.some(q=>q.length))for(const q of qs)if(q.length&&vids.length<want)vids.push(q.shift());
  for(const v of pool)if(vids.length<want&&v.status==='gesehen'&&v.fav&&gap('v:'+v.vid)>=FAV_GAP)vids.push(v);
  // Tarot to learn: one card a day, the one studied longest ago, in a fixed personal order.
  let tarotCard=null;
  if(tarot>0&&topics.includes('magie')){const order=shuffle([...Array(tarot).keys()],rng('tarot-order'));tarotCard=order.map((t,i)=>({t,i,l:last('t:'+t)})).sort((a,b)=>a.l.localeCompare(b.l)||a.i-b.i)[0].t}
  // One old note of their own.
  const mine=shuffle(own.filter(o=>o&&o.id&&typeof o.createdAt==='string'&&isDay(o.createdAt.slice(0,10))&&days(o.createdAt.slice(0,10),day)>=OWN_AGE&&gap('o:'+o.id)>=OWN_GAP),r)[0]||null;
  // Written cards fill the rest: round robin over the topics, never shown first, then shown longest ago.
  const daily=web.slice(0,size>=12?2:1).map(src=>({type:'web',ref:'w:'+src+':'+day}));
  const keptRefs=new Set(kept.map(k=>k.ref)),n=Math.max(0,size-1-vids.length-(tarotCard!=null?1:0)-(mine?1:0)-daily.length);
  const byTopic=new Map(topics.map(t=>[t,shuffle(cards.filter(c=>c&&c.topic===t&&!keptRefs.has('c:'+c.id)),r).sort((a,b)=>last('c:'+a.id).localeCompare(last('c:'+b.id)))]));
  const order=shuffle(topics.filter(t=>byTopic.get(t).length),r),written=[];
  while(written.length<n&&order.some(t=>byTopic.get(t).length))for(const t of order){const q=byTopic.get(t);if(q.length&&written.length<n)written.push(q.shift())}
  const seq=[];let wi=0,vi=0;
  while(wi<written.length||vi<vids.length){if(wi<written.length)seq.push({type:'card',ref:'c:'+written[wi++].id});if(vi<vids.length)seq.push({type:'video',ref:'v:'+vids[vi++].vid})}
  if(tarotCard!=null)seq.splice(Math.min(2,seq.length),0,{type:'tarot',ref:'t:'+tarotCard});
  if(mine)seq.splice(Math.min(seq.length,Math.floor(seq.length/2)+1),0,{type:'own',ref:'o:'+mine.id});
  // Pictures of the day: one right after the sky, a second one later on.
  if(daily[0])seq.unshift(daily[0]);if(daily[1])seq.splice(Math.min(seq.length,Math.round(seq.length*.65)),0,daily[1]);
  return [{type:'sky',ref:'sky:'+day},...seq].slice(0,size);
 }
 /* Makes sure the stack of `day` exists; a new day closes the old one in the log. */
 function today(db,day,src){
  const d=ensure(db);
  if(d.day!==day||!d.cards.length){
   if(d.day&&d.cards.length){d.log.push({day:d.day,shown:Math.min(d.cards.length,d.reached+1),total:d.cards.length,kept:d.stats.kept||0,watched:d.stats.watched||0});d.log=d.log.slice(-120)}
   d.cards=build({...src,day,size:d.size,topics:d.topics,seen:d.seen,kept:d.kept});d.day=day;d.pos=0;d.reached=0;d.stats={kept:0,watched:0};
  }
  return d;
 }
 /* Opens card `i` (or the end when i = length) and remembers it as shown today. */
 function go(db,i){
  const d=ensure(db),pos=Math.max(0,Math.min(d.cards.length,Math.floor(i)||0));d.pos=pos;
  if(pos<d.cards.length){d.reached=Math.max(d.reached,pos);const c=d.cards[pos];if(c.type!=='sky')d.seen[c.ref]=d.day}
  else d.reached=Math.max(d.reached,d.cards.length-1);
  return d.cards[pos]||null;
 }
 const finished=db=>{const d=ensure(db);return d.cards.length>0&&d.pos>=d.cards.length};
 /* Keeps a card in the collection (or gives it back). Written cards, tarot cards and pictures of the day
    can be kept; a picture keeps a copy of its description, because the source changes every day. */
 function keep(db,ref,now,data){
  const d=ensure(db),i=d.kept.findIndex(k=>k.ref===ref);
  if(i>=0){d.kept.splice(i,1);d.stats.kept=Math.max(0,(d.stats.kept||0)-1);return null}
  if(!/^(c|t|w):/.test(ref))throw Error('Nur Karten lassen sich behalten.');
  if(ref.startsWith('w:')&&!(data&&data.title))throw Error('Diese Karte ist noch nicht geladen.');
  const k={ref,at:now,no:d.next++};if(ref.startsWith('w:'))k.data=data;d.kept.push(k);d.stats.kept=(d.stats.kept||0)+1;return k;
 }
 const isKept=(db,ref)=>ensure(db).kept.some(k=>k.ref===ref);
 function watched(db){const d=ensure(db);d.stats.watched=(d.stats.watched||0)+1}
 /* Settings take effect today when the stack is still untouched, otherwise tomorrow. */
 function configure(db,{size,topics,web}){
  const d=ensure(db);if(SIZES.includes(size))d.size=size;if(typeof web==='boolean')d.web=web;
  if(Array.isArray(topics)){const t=TOPICS.filter(x=>topics.includes(x));if(!t.length)throw Error('Mindestens ein Thema bitte.');d.topics=t}
  const fresh=d.reached===0&&d.pos===0;if(fresh){d.cards=[];}
  return fresh;
 }
 /* Cache for pictures of the day: only the last ten days are kept (kept cards have their own copy). */
 function cache(db,ref,entry,day){
  const d=ensure(db);if(entry)d.webCache[ref]=entry;
  for(const k of Object.keys(d.webCache)){const at=k.split(':')[2]||'';if(!isDay(at)||(isDay(day)&&days(at,day)>10))delete d.webCache[k]}
  return d.webCache[ref]||null;
 }
 /* Days with a stack, kept cards, watched videos – for "Dein Himmel" and the end card. */
 function summary(db){
  const d=ensure(db),all=[...d.log,...(d.cards.length?[{day:d.day,shown:Math.min(d.cards.length,d.reached+1),total:d.cards.length,kept:d.stats.kept||0,watched:d.stats.watched||0}]:[])];
  return {days:all.length,finished:all.filter(x=>x.shown>=x.total).length,kept:d.kept.length,watched:all.reduce((a,x)=>a+(x.watched||0),0)};
 }
 return {TOPICS,SIZES,ensure,build,today,go,finished,keep,isKept,watched,configure,cache,summary,rng,hash};
});
