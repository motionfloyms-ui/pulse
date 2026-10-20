// SOURCE: domain/game/sky.js
/* "Dein Himmel": achievements derived from what is already recorded. Nothing can be lost:
   no streaks, a star once lit stays lit. Plus a 90-day glow map of how much happened each day. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseSky=api})(globalThis,function(){
 'use strict';
 const day=s=>String(s||'').slice(0,10);
 const addDay=(d,n)=>new Date(Date.parse(d+'T12:00:00Z')+n*864e5).toISOString().slice(0,10);
 /* Points per day from all sources. */
 function activity(db,{proteinGoal=null}={}){
  const pts={},cap={};const add=(d,n,key,max)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return;if(key){const k=key+d;cap[k]=(cap[k]||0)+1;if(cap[k]>max)return}pts[d]=(pts[d]||0)+n};
  const trained=new Set();for(const w of db.workouts||[])if(w&&w.date)trained.add(w.date);for(const [d,x] of Object.entries(db.days||{}))if(x&&(x.workout||x.homeWorkoutCompleted))trained.add(d);
  for(const d of trained)add(d,3);
  for(const m of db.meals||[])add(m&&m.date,1,'meal',3);
  const water=Number(db.waterGoal)||2;let protDays=0,waterDays=0;
  for(const [d,x] of Object.entries(db.days||{})){if(!x)continue;if(proteinGoal&&x.protein>=proteinGoal){add(d,2);protDays++}if(x.water>=water){add(d,2);waterDays++}}
  for(const x of db.life?.items||[]){add(day(x.createdAt),1,'new',3);if(x.kind==='task'&&x.status==='done')add(day(x.updatedAt),1,'done',3)}
  const tarot=db.life?.preferences?.tarotHistory||[];for(const t of tarot)add(t&&t.date,2,'tarot',1);
  for(const v of db.videos?.items||[]){add(day(v.addedAt),1,'vid',2);if(v.seenAt)add(day(v.seenAt),1,'seen',2)}
  for(const s of db.magic?.sigils||[]){add(day(s.createdAt),2,'sg',1);for(const c of s.charges||[])add(day(c.at),2,'ch',1)}
  return {pts,trained,protDays,waterDays};
 }
 const level=p=>p<=0?0:p<3?1:p<6?2:p<10?3:4;
 function glow(db,today,opts){const {pts}=activity(db,opts);return Array.from({length:91},(_,i)=>{const d=addDay(today,i-90);return {date:d,points:pts[d]||0,level:level(pts[d]||0)}})}
 /* Constellations: each group's stars in a 360×240 sky, in unlock order. */
 const GROUPS=[
  {id:'seherin',name:'Die Seherin',hint:'Tarot',at:[[40,40],[70,28],[98,46],[86,76],[56,70]]},
  {id:'kriegerin',name:'Die Kriegerin',hint:'Training',at:[[150,30],[176,52],[204,34],[190,82],[160,96]]},
  {id:'sammlerin',name:'Die Sammlerin',hint:'Videos',at:[[262,36],[292,26],[322,44],[312,76],[278,70]]},
  {id:'magierin',name:'Die Magierin',hint:'Sigillen',at:[[44,150],[72,130],[100,152],[80,184],[50,196]]},
  {id:'hueterin',name:'Die Hüterin',hint:'Essen & Wasser',at:[[156,140],[184,124],[212,146],[196,178]]},
  {id:'chronistin',name:'Die Chronistin',hint:'Einträge & Termine',at:[[262,138],[292,126],[322,148],[306,182],[274,186]]},
  {id:'mond',name:'Der Mond',hint:'Ein ganzer Zyklus',at:[[180,214]]}
 ];
 function badges(db,{today,proteinGoal=null,phaseOf=null}={}){
  const A=activity(db,{proteinGoal}),tarot=db.life?.preferences?.tarotHistory||[],cards=new Set(tarot.map(t=>t&&t.index).filter(Number.isInteger));
  const majors=[...cards].filter(i=>i<22).length,vids=db.videos?.items||[],shelves=db.videos?.shelves||[],marks=vids.reduce((a,v)=>a+(v.marks?.length||0),0);
  const sg=db.magic?.sigils||[],life=db.life?.items||[],events=life.filter(x=>x.kind==='event').length+(db.events||[]).filter(e=>e&&e.type==='calendar-plan').length;
  const phases=new Set();if(phaseOf)for(const [d,p] of Object.entries(A.pts))if(p>0)phases.add(phaseOf(d));
  const B=(group,id,title,desc,value,need)=>({group,id,title,desc,value:Math.min(value,need),need,done:value>=need});
  const list=[
   B('seherin','t1','Erste Karte','Eine Tageskarte gezogen oder eingetragen',cards.size,1),
   B('seherin','t22','Alle Großen Arkana','Jede der 22 großen Karten mindestens einmal',majors,22),
   B('seherin','t40','Halbes Deck','40 verschiedene Karten',cards.size,40),
   B('seherin','t78','Das ganze Deck','Alle 78 Karten gezogen',cards.size,78),
   B('seherin','tdays','Kartenjahr','An 100 Tagen eine Tageskarte',new Set(tarot.map(t=>t&&t.date)).size,100),
   B('kriegerin','w1','Erstes Training','Ein Trainingstag',A.trained.size,1),
   B('kriegerin','w10','Zehn Tage Eisen','10 Trainingstage',A.trained.size,10),
   B('kriegerin','w25','Fünfundzwanzig','25 Trainingstage',A.trained.size,25),
   B('kriegerin','w50','Fünfzig','50 Trainingstage',A.trained.size,50),
   B('kriegerin','w100','Hundert','100 Trainingstage',A.trained.size,100),
   B('sammlerin','v1','Erstes Fundstück','Ein Video gesammelt',vids.length,1),
   B('sammlerin','v10','Kleine Sammlung','10 Videos',vids.length,10),
   B('sammlerin','v50','Archiv','50 Videos',vids.length,50),
   B('sammlerin','v100','Hundert Fundstücke','100 Videos',vids.length,100),
   B('sammlerin','shelf5','Regalbauerin','5 Regale angelegt',shelves.length,5),
   B('magierin','s1','Erste Sigille','Eine Sigille erschaffen',sg.length,1),
   B('magierin','sc','Geladen','Eine Sigille in Gnosis geladen',sg.filter(s=>s.charges?.length).length,1),
   B('magierin','sf','Vergessen gelernt','5 Sigillen bewusst vergessen',sg.filter(s=>s.forgottenAt).length,5),
   B('magierin','sr','Tagebuch','Ein Ergebnis eingetragen',sg.filter(s=>s.result).length,1),
   B('magierin','s13','Dreizehn','13 Sigillen',sg.length,13),
   B('hueterin','p7','Eiweißwoche','An 7 Tagen das Proteinziel',A.protDays,7),
   B('hueterin','p30','Eiweißmonat','An 30 Tagen das Proteinziel',A.protDays,30),
   B('hueterin','h7','Gut gewässert','An 7 Tagen das Wasserziel',A.waterDays,7),
   B('hueterin','h30','Quelle','An 30 Tagen das Wasserziel',A.waterDays,30),
   B('chronistin','n10','Erste Seiten','10 eigene Einträge',life.length,10),
   B('chronistin','n100','Hundert Seiten','100 eigene Einträge',life.length,100),
   B('chronistin','e10','Terminkalender','10 Termine',events,10),
   B('chronistin','ics','Umgezogen','Termine aus einer .ics-Datei übernommen',life.some(x=>x.ics)?1:0,1),
   B('chronistin','m25','Stellenjägerin','25 Stellen in Videos gemerkt',marks,25),
   B('mond','moon','Voller Zyklus','An Tagen in allen 8 Mondphasen etwas getan',phases.size,8)
  ];
  for(const g of GROUPS){const mine=list.filter(b=>b.group===g.id);mine.forEach((b,i)=>{const p=g.at[i%g.at.length];b.x=p[0];b.y=p[1]})}
  return list;
 }
 const RANKS=[[0,'Dämmerung'],[1,'Erster Stern'],[4,'Sternbild'],[9,'Sternhaufen'],[15,'Milchstraße'],[22,'Galaxie'],[30,'Kosmos']];
 function rank(n){let r=RANKS[0];for(const x of RANKS)if(n>=x[0])r=x;const next=RANKS.find(x=>x[0]>n);return {name:r[1],next:next?{name:next[1],need:next[0]-n}:null}}
 /* Yesterday in one line. */
 function yesterday(db,today,{proteinGoal=null}={}){
  const d=addDay(today,-1),x=(db.days||{})[d]||{},parts=[];
  const done=(db.life?.items||[]).filter(i=>i.kind==='task'&&i.status==='done'&&day(i.updatedAt)===d).length;if(done)parts.push(done+(done===1?' Aufgabe erledigt':' Aufgaben erledigt'));
  const A=activity(db,{proteinGoal});if(A.trained.has(d))parts.push('Training');
  if(x.protein)parts.push(Math.round(x.protein)+' g Protein');if(x.water)parts.push(String(Math.round(x.water*10)/10).replace('.',',')+' L Wasser');
  const v=(db.videos?.items||[]).filter(i=>day(i.addedAt)===d).length;if(v)parts.push(v+(v===1?' Video gesammelt':' Videos gesammelt'));
  const t=(db.life?.preferences?.tarotHistory||[]).find(i=>i&&i.date===d);if(t)parts.push('Tageskarte');
  const s=(db.magic?.sigils||[]).filter(i=>day(i.createdAt)===d).length;if(s)parts.push(s===1?'eine Sigille':s+' Sigillen');
  return parts;
 }
 return {activity,glow,badges,GROUPS,rank,yesterday,level};
});
