// SOURCE: domain/magic/sigil.js
/* Sigils after Austin Osman Spare: reduce a statement of intent to its letters and draw them as a
   single glyph, on a letter wheel or on the magic square of Saturn. Plus the sigil journal
   (created, charged, forgotten, result). Pure functions, no DOM. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseSigil=api})(globalThis,function(){
 'use strict';
 const ALPHA='ABCDEFGHIJKLMNOPQRSTUVWXYZ';
 /* Letters of an intent: umlauts folded, vowels removed (unless nothing else is left), duplicates removed. */
 function reduce(text,{vowels=false}={}){
  const up=String(text||'').toUpperCase().replace(/Ä/g,'A').replace(/Ö/g,'O').replace(/Ü/g,'U').replace(/ß/g,'S').normalize('NFKD').replace(/[^A-Z]/g,'');
  const pick=s=>[...new Set(s)].join('');
  const no=up.replace(/[AEIOU]/g,'');
  return pick(vowels||!no?up:no);
 }
 function rng(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 function hash(s){let h=2166136261;for(const c of String(s))h=Math.imul(h^c.charCodeAt(0),16777619);return h>>>0}
 const SATURN=[[4,9,2],[3,5,7],[8,1,6]];
 const cell=n=>{for(let r=0;r<3;r++)for(let c=0;c<3;c++)if(SATURN[r][c]===n)return {x:40+c*60,y:40+r*60};return {x:100,y:100}};
 /* Pythagorean value 1–9 of a letter (A=1 … I=9, J=1 …). */
 const value=ch=>ALPHA.indexOf(ch)%9+1;
 function points(letters,method,seed){
  const R=rng(seed);
  if(method==='quadrat'){
   const out=[];let last=0;for(const ch of letters){const v=value(ch);if(v!==last)out.push({...cell(v),ch});last=v}
   return out.map(p=>({x:p.x+(R()-.5)*14,y:p.y+(R()-.5)*14,ch:p.ch}));
  }
  const rot=R()*Math.PI*2,rad=74;
  return [...letters].map(ch=>{const a=rot+ALPHA.indexOf(ch)/26*Math.PI*2;const r=rad*(0.78+R()*0.3);return {x:100+Math.cos(a)*r,y:100+Math.sin(a)*r,ch}});
 }
 const f=n=>Math.round(n*10)/10;
 /* SVG geometry (viewBox 0 0 200 200): path, start ring and the closing bar. */
 function draw(letters,{method='rad',style='geschwungen',seed=1}={}){
  let pts=points(letters,method,seed);
  if(!pts.length)return {d:'',start:null,end:null,points:[]};
  if(pts.length===1)pts=[pts[0],{x:200-pts[0].x,y:200-pts[0].y,ch:''}];
  let d='M'+f(pts[0].x)+' '+f(pts[0].y);
  if(style==='gerade')for(const p of pts.slice(1))d+='L'+f(p.x)+' '+f(p.y);
  else{const R=rng(seed^0x9E3779B9);for(let i=1;i<pts.length;i++){const a=pts[i-1],b=pts[i],mx=(a.x+b.x)/2,my=(a.y+b.y)/2,dx=b.x-a.x,dy=b.y-a.y,k=(R()-.5)*.9;d+='Q'+f(mx-dy*k)+' '+f(my+dx*k)+' '+f(b.x)+' '+f(b.y)}}
  const a=pts[pts.length-2],b=pts[pts.length-1],ang=Math.atan2(b.y-a.y,b.x-a.x)+Math.PI/2,L=11;
  return {d,start:{x:f(pts[0].x),y:f(pts[0].y)},end:{x1:f(b.x+Math.cos(ang)*L),y1:f(b.y+Math.sin(ang)*L),x2:f(b.x-Math.cos(ang)*L),y2:f(b.y-Math.sin(ang)*L)},points:pts};
 }
 function svg(letters,opts={},{stroke='currentColor',width=5,cls=''}={}){
  const g=draw(letters,opts);if(!g.d)return '';
  return '<svg class="'+cls+'" viewBox="0 0 200 200" aria-hidden="true"><g fill="none" stroke="'+stroke+'" stroke-width="'+width+'" stroke-linecap="round" stroke-linejoin="round"><path d="'+g.d+'"/><circle cx="'+g.start.x+'" cy="'+g.start.y+'" r="'+(width*1.5)+'"/><line x1="'+g.end.x1+'" y1="'+g.end.y1+'" x2="'+g.end.x2+'" y2="'+g.end.y2+'"/></g></svg>';
 }
 /* ---------- Journal (db.magic) ---------- */
 const STATUS=['neu','geladen','vergessen','erfuellt','offen'];
 function ensure(db){if(!db.magic||typeof db.magic!=='object'||Array.isArray(db.magic))db.magic={version:1,sigils:[],next:1};const m=db.magic;if(!Array.isArray(m.sigils))m.sigils=[];if(!Number.isInteger(m.next)||m.next<1)m.next=m.sigils.reduce((a,s)=>Math.max(a,Number(s&&s.no)||0),0)+1;return m}
 function normalize(db){
  const m=ensure(db),ids=new Set();
  m.sigils=m.sigils.filter(s=>s&&typeof s.id==='string'&&!ids.has(s.id)&&ids.add(s.id)).map(s=>({id:s.id,no:Number(s.no)||0,intent:String(s.intent||'').slice(0,300),letters:String(s.letters||reduce(s.intent)).replace(/[^A-Z]/g,'').slice(0,40),method:s.method==='quadrat'?'quadrat':'rad',style:s.style==='gerade'?'gerade':'geschwungen',seed:Number(s.seed)>>>0,createdAt:String(s.createdAt||''),phase:Number.isInteger(s.phase)?s.phase:null,status:STATUS.includes(s.status)?s.status:'neu',charges:Array.isArray(s.charges)?s.charges.filter(c=>c&&c.at).map(c=>({at:String(c.at),minutes:Math.max(0,Number(c.minutes)||0),mode:c.mode==='ekstatisch'?'ekstatisch':'still'})):[],forgottenAt:String(s.forgottenAt||''),result:s.result&&typeof s.result==='object'?{note:String(s.result.note||'').slice(0,4000),score:Math.max(0,Math.min(10,Number(s.result.score)||0)),at:String(s.result.at||'')}:null})).filter(s=>s.letters);
  let next=m.sigils.reduce((a,s)=>Math.max(a,s.no),0)+1;for(const s of m.sigils)if(!s.no)s.no=next++;m.next=Math.max(m.next,next);return m;
 }
 function create(db,{intent,method='rad',style='geschwungen',seed,phase=null,vowels=false},now,id){
  const text=String(intent||'').trim();if(text.length<3)throw Error('Schreib deine Absicht als kurzen Satz.');
  const letters=reduce(text,{vowels});if(!letters)throw Error('Der Satz braucht Buchstaben.');
  const m=ensure(db);const s={id:id||'sg-'+Date.now().toString(36),no:m.next++,intent:text.slice(0,300),letters,method:method==='quadrat'?'quadrat':'rad',style:style==='gerade'?'gerade':'geschwungen',seed:(seed??hash(text))>>>0,createdAt:now,phase,status:'neu',charges:[],forgottenAt:'',result:null};
  m.sigils.push(s);return s;
 }
 const need=(db,id)=>{const s=ensure(db).sigils.find(x=>x.id===id);if(!s)throw Error('Diese Sigille gibt es nicht mehr.');return s};
 function charge(db,id,minutes,mode,now){const s=need(db,id);s.charges.push({at:now,minutes:Math.max(0,Math.round(minutes*10)/10),mode:mode==='ekstatisch'?'ekstatisch':'still'});if(s.status==='neu')s.status='geladen';return s}
 function forget(db,id,now){const s=need(db,id);s.status='vergessen';s.forgottenAt=now;return s}
 function result(db,id,note,score,now){const s=need(db,id);s.result={note:String(note||'').slice(0,4000),score:Math.max(0,Math.min(10,Math.round(Number(score)||0))),at:now};s.status=s.result.score>=5?'erfuellt':'offen';return s}
 function remove(db,id){const m=ensure(db);m.sigils=m.sigils.filter(s=>s.id!==id)}
 const LABEL={neu:'Neu',geladen:'Geladen',vergessen:'Vergessen',erfuellt:'Eingetreten',offen:'Ausgewertet'};
 return {reduce,draw,svg,value,hash,ensure,normalize,create,charge,forget,result,remove,LABEL};
});
