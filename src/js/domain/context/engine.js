// SOURCE: domain/context/engine.js
/* One pure context/plan/action path. No DOM, persistence or inferred completion. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseContext=api})(globalThis,function(){
 const pad=n=>String(n).padStart(2,'0');
 function localDay(d=new Date()){return `${d.getFullYear()}-${pad(d.getMonth()+1)}-${pad(d.getDate())}`}
 function offset(date,n){const d=new Date(date+'T12:00:00');d.setDate(d.getDate()+n);return localDay(d)}
 function weekday(date){return new Date(date+'T12:00:00').getDay()}
 function entries(db){const out=[];for(const store of ['inbox','tasks'])for(const [index,record] of (db[store]||[]).entries()){if(['cancelled','superseded'].includes(record.status))continue;const id=record.id??index;if(store==='tasks'&&out.some(x=>x.record.id!=null&&x.record.id===record.id&&(x.record.text||x.record.title)===(record.text||record.title)))continue;out.push({key:store+':'+id,store,index,record,text:record.text||record.title||'Eintrag',type:record.type||(store==='tasks'?'task':'note')})}return out}
 function trip(db,date){return (db.events||[]).filter(e=>e.type==='travel-plan'&&e.status!=='superseded'&&e.status!=='cancelled'&&e.validFrom<=date&&e.validTo>=date).sort((a,b)=>String(b.recordedAt).localeCompare(String(a.recordedAt)))[0]||null}
 function returnPolicy(db,date){return (db.events||[]).filter(e=>e.type==='return-training-rule'&&!['superseded','cancelled'].includes(e.status)&&e.validFrom<=date&&e.validTo>=date).sort((a,b)=>String(b.recordedAt).localeCompare(String(a.recordedAt)))[0]||null}
 function training(db,date){
  const d=db.days[date]||{},session=db.activeWorkout?.date===date?db.activeWorkout:null;
  if(['A','B'].includes(d.workout))return {kind:'gym',plan:d.workout,completed:true};
  if(d.homeWorkoutCompleted)return {kind:'home',completed:true};
  if(session)return {kind:'gym',plan:session.plan,active:true};
  if(Object.prototype.hasOwnProperty.call(db.planOverrides||{},date)){const p=db.planOverrides[date];return ['A','B'].includes(p)?{kind:'gym',plan:p}:null}
  const home=(db.events||[]).find(e=>e.type==='home-training-plan'&&e.date===date&&!['superseded','cancelled'].includes(e.status));
  if(home)return {kind:'home',plan:null,completed:home.status==='completed'};
  if(trip(db,date))return null;
  const intent=(db.events||[]).some(e=>e.type==='gym-training-plan'&&e.date===date&&!['cancelled','superseded'].includes(e.status));
  if(!intent&&![1,3,5].includes(weekday(date)))return null;
  const history=(db.workouts||[]).filter(w=>w.date<date&&['A','B'].includes(w.plan)).sort((a,b)=>b.date.localeCompare(a.date)||(b.ts||0)-(a.ts||0));
  return {kind:'gym',plan:history.length?(history[0].plan==='A'?'B':'A'):'A'};
 }
 function score(r){if(!r)return null;const fields=['sleep','sleepQ','stress','sore','energy','mood'];if(fields.some(k=>!Number.isFinite(r[k])))return null;const sleep=Math.max(0,Math.min(100,100-Math.abs(8-r.sleep)*18));return Math.round(sleep*.25+r.sleepQ*10*.15+(10-r.stress)*10*.2+(10-r.sore)*10*.1+r.energy*10*.2+r.mood*10*.1)}
 function context(db,date,currentDate=date){
  const day=db.days[date]||{},cx=day.cycleContext||{};
  const cycle=(db.cycles||[]).filter(c=>c.date===date).at(-1)||null;
  const legacy=date===currentDate&&(!db.settings?.dayModeDate||db.settings.dayModeDate===date)?db.settings?.dayMode:'auto';
  const manual=day.dayMode||legacy||'auto';
  const text=(day.sickReason||'')+' '+(!day.cycleContext?(cycle?.symptoms||''):'');
  const severe=!!day.sick||!!day.stepsExempt||Number(cx.pain)>=7||Number(cx.symptoms)>=8||/stark|schlimm|heftig|erbrechen|bettläg/i.test(text);
  const rs=score(day.recovery),low=(rs!==null&&rs<60)||Number(cx.audhs)>=8||Number(cx.mental)>=8;
  const mode=['normal','low','recovery'].includes(manual)?manual:severe?'recovery':low?'low':'normal';
  return {date,day,cycle,mode,severe:mode==='recovery',low:mode==='low',travel:trip(db,date),returnPolicy:returnPolicy(db,date),training:training(db,date)};
 }
 function mealSlots(date){return [{time:'15:00',label:'Erste Mahlzeit'},{time:weekday(date)===4?'16:45':'18:30',label:'Warme Mahlzeit'},{time:'21:00',label:'Abendessen'},{time:'23:45',label:'Spätmahlzeit'}]}
 function foodMessage(db,date,now){const c=context(db,date),minutes=now.getHours()*60+now.getMinutes();if(c.mode==='recovery')return 'Versorgung vor Optimierung. Die warme Mahlzeit und dein Abendessen bleiben eingeplant.';if(c.travel)return 'Unterwegs zählt halten. Regelmäßig essen, Protein mitnehmen; kein Kalorienzählen nötig.';if(minutes<900)return 'Deine erste Mahlzeit ist um 15:00 geplant. Du musst kein Frühstück nachholen.';const slots=mealSlots(date),next=slots.find(s=>{const [h,m]=s.time.split(':').map(Number);return h*60+m>=minutes})||slots.at(-1);return next.label+' um '+next.time+'. Die warme Mahlzeit, das Abendessen und die Spätmahlzeit bleiben erhalten – kein Vorziehen oder Kompensieren.'}
 function actionId(a,date){return a.id||[date,a.kind,a.task?.id||a.title||''].join('|')}
 function dismissed(db,a){return !!(db.dismissedActions?.[a.id]||db.dismissedActions?.[[a.date,a.kind,a.task?.id||a.title||''].join('|')])}
 function candidates(db,date,now){
  const c=context(db,date,localDay(now)),d=c.day,list=[];
  const add=(kind,title,detail,extra={})=>list.push({id:date+'|'+kind+(extra.entryKey?'|'+extra.entryKey:''),date,kind,title,detail,...extra});
  if(c.mode==='recovery'){add('recovery','Versorgung zuerst','Trinken, etwas Verträgliches essen und erholen. Kein Nachholen.');return list}
  if(c.returnPolicy&&c.training?.kind==='gym'&&!c.training.completed&&!d.trainingSkipped&&(db.events||[]).some(e=>e.type==='gym-training-plan'&&e.date===date&&!['cancelled','superseded'].includes(e.status)))add('training','Dein Wiedereinstieg',c.returnPolicy.detail,{plan:c.training.plan});
  const all=entries(db).filter(e=>!e.record.done&&!e.record.deferred);
  const due=all.filter(e=>e.type==='task'&&e.record.due&&e.record.due<=date).sort((a,b)=>a.record.due.localeCompare(b.record.due));
  due.forEach(e=>add('task',e.text,'Diese Aufgabe ist fällig.',{entryKey:e.key,task:e.record}));
  if(Number(d.water||0)<1)add('water','Wasser','Ein Glas reicht als nächster Schritt.');
  const hour=now.getHours();
  if(hour>=15||Number(d.meals)>0)add('food','Nächste Mahlzeit',foodMessage(db,date,now));
  if(c.training&&!c.training.completed&&!d.trainingSkipped&&hour>=14&&!list.some(a=>a.kind==='training'))add(c.training.kind==='home'?'home-training':'training',c.training.kind==='home'?'Heimtraining':`Training ${c.training.plan}`,c.training.kind==='home'?'Heute in deinem Reiseplan. Kein zusätzliches Gym nötig.':(c.returnPolicy?c.returnPolicy.detail:'Dein Plan ist vorbereitet. Gewichte bleiben aus deiner bestätigten Historie.'),{plan:c.training.plan});
  const pending=all.find(e=>!e.record.due||e.record.due<=date);
  if(pending&&c.mode!=='low'&&!due.some(e=>e.key===pending.key))add('brain','Eine Sache klären',pending.text,{entryKey:pending.key});
  return list;
 }
 function next(db,date,now){return candidates(db,date,now).find(a=>!dismissed(db,a))||{id:date+'|done',date,kind:'done',title:'Für jetzt genug',detail:trip(db,date)?'Unterwegs zählt halten. Kein Aufholen, kein Extra-Programm.':'PULSE hält den Rest bereit. Du musst gerade nichts nachholen.'}}
 return {localDay,offset,entries,trip,returnPolicy,training,score,context,mealSlots,foodMessage,actionId,dismissed,candidates,next};
});


