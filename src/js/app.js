// SOURCE: app.js

const A=[
['Beinpresse (07)','3×8–15','40','2:00','10/12/12'],['Glute Drive (Lady Gym)','3×8–12','40','2:00','12/12/12 @40 gesamt'],['Latzug (05)','3×8–12','32.5','2:00','9 @32.5'],['Brustpresse (01)','3×8–12','22.5','1:30','12/8 @22.5'],['Beinbeuger sitzend (HS)','3×10–15','27.5','1:30','10/12/12'],['Seitheben Kurzhanteln','3×12–15','3','1:00','15/14/12'],['Trizepsmaschine','3×12–15','neu','1:00','neu'],['Bauchmaschine I (24)','2×10–15','27.5','1:30','13/13/10']];
const B=[['Glute Drive (Lady Gym)','3×8–12','40','2:00','12/12/12 @40 gesamt'],['Rudern sitzend (03)','3×8–12','32.5','2:00','15@27.5; 12/12@30'],['Schulterpresse','3×8–12','5','1:30','8@7.5; 10/8@5'],['Abduktoren','3×12–20','45','1:30','16/20/20@40'],['Rückenstreckung (13)','3×10–15','32.5','1:30','15@27.5;15/15@30'],['Seitheben Kurzhanteln','3×12–15','3','1:00','15/14/12'],['Bauchmaschine I (24)','3×10–15','27.5','1:30','13/13/10']];
const key=()=>{const d=new Date(),p=n=>String(n).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}; const dayNames=['So','Mo','Di','Mi','Do','Fr','Sa'];
const storage=PulseStorage.create({getStorage:()=>localStorage,state:PulseState,migrate:value=>PulseUnify.run(value,key)});
let db;
try{db=storage.load()}catch(error){PulseStorageUI.blocked(error,storage);throw error}
const {upsertFact,currentFact,supersedeFact,addDecision,addEvent,flagIssue}=PulseMemory.create(()=>db,key);
function today(){if(!db.days[key()])db.days[key()]={water:0,steps:0,kcal:0,protein:0,carbs:0,fat:0,fiber:0,meals:0,recovery:null,waist:null,energyDrinks:0,cycleContext:null};return db.days[key()]}

let renderQueued=false,toastTimer=null;
function scheduleRender(){if(renderQueued)return;renderQueued=true;requestAnimationFrame(()=>{renderQueued=false;render()})}
function save(){try{storage.save(db);PulseStorageUI.clear()}catch(error){PulseStorageUI.unsaved(error,{exportCurrent:()=>PulseStorageUI.download(storage.exportText(db),'PULSE_offene_Aenderungen_'+key()+'.json'),retry:()=>save()});toast(error.message);return false}scheduleRender();return true}
function toast(x,actionLabel=''){
 if(storage.lastError){x=storage.lastError.message;actionLabel=''}
 let t=document.getElementById('toast');t.replaceChildren();
 let s=document.createElement('span');s.textContent=x;t.appendChild(s);
 if(actionLabel){let b=document.createElement('button');b.type='button';b.textContent=actionLabel;const target=db.undoStack.at(-1);b.onclick=()=>{t.classList.remove('show');if(db.undoStack.at(-1)!==target)return toast('Inzwischen gab es eine neuere Änderung. Nutze ↶ oben für die letzte.');undoLast()};t.appendChild(b)}
 t.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>t.classList.remove('show'),3200)
}
function esc(s){return String(s??'').replace(/[&<>'"]/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;',"'":'&#39;','"':'&quot;'}[c]))}
function dateLabel(d=new Date()){return d.toLocaleDateString('de-DE',{weekday:'long',day:'2-digit',month:'long',year:'numeric'})}
function isoOffset(n){let d=new Date();d.setDate(d.getDate()+n);const p=x=>String(x).padStart(2,'0');return `${d.getFullYear()}-${p(d.getMonth()+1)}-${p(d.getDate())}`}


function addWater(x){today().water=Math.min(6,today().water+x);save();toast('Wasser gespeichert')};function setWaterGoal(){openValueEditor('Wasserziel','Liter pro Tag',db.waterGoal,'0.1',x=>{if(x&&!isNaN(x)){db.waterGoal=+x;save();toast('Wasserziel gespeichert')}})}

const BUILTIN_FOODS=[
 {id:'skyr',name:'Skyr',aliases:['skyr'],per100:{kcal:63,protein:10.5,carbs:4,fat:.2,fiber:0},confidence:'berechnet'},
 {id:'whey-sportness',name:'Sportness Whey Vanille',aliases:['sportness whey','whey vanille','whey'],per100:{kcal:373.3,protein:80,carbs:7,fat:5,fiber:0},confidence:'etikett'},
 {id:'raspberries',name:'Himbeeren',aliases:['himbeeren','beeren'],per100:{kcal:43,protein:1.3,carbs:4.8,fat:.3,fiber:6.5},confidence:'geschaetzt'},
 {id:'magerquark',name:'Magerquark',aliases:['magerquark','quark'],per100:{kcal:68,protein:12,carbs:4,fat:.2,fiber:0},confidence:'berechnet'},
 {id:'cottage',name:'Hüttenkäse',aliases:['hüttenkäse','huettenkaese','cottage cheese'],per100:{kcal:90,protein:12,carbs:3,fat:3,fiber:0},confidence:'berechnet'},
 {id:'tofu',name:'Tofu',aliases:['tofu'],per100:{kcal:135,protein:14,carbs:2,fat:8,fiber:1},confidence:'geschaetzt'},
 {id:'egg',name:'Ei',aliases:['eier','ei'],perPiece:{kcal:80,protein:7,carbs:.5,fat:5.5,fiber:0},confidence:'geschaetzt'}
];


function nums(x){return Math.round(x*10)/10}
function nutritionScale(base,factor){let o={};['kcal','protein','carbs','fat','fiber'].forEach(k=>o[k]=nums((base[k]||0)*factor));return o}


function confidenceLabel(c){return c==='etikett'?'Etikett':c==='gespeichert'?'Gespeichert':c==='berechnet'?'Berechnet':'≈ geschätzt'}
function understandFood(){let t=document.getElementById('smartFoodText').value.trim();if(!t)return toast('Beschreibe kurz dein Essen');let parts=parseFoodText(t);window.smartDraft={text:t,parts};renderSmartPreview()}


function clearSmartFood(){pendingFoodCapture=null;window.smartDraft=null;let a=document.getElementById('smartFoodText'),b=document.getElementById('smartFoodPreview');if(a)a.value='';if(b)b.innerHTML=''}
function smartTemplate(type){let a=document.getElementById('smartFoodText');if(type==='skyr')a.value='150 g Skyr, 30 g Sportness Whey, 150 g Himbeeren';else a.value='250 g Magerquark, 100 g Himbeeren';understandFood()}


function quickMeal(name,k,p,c,f,fi){document.getElementById('mTime').value=name.includes('Skyr +')?'15:00':'23:45';document.getElementById('mName').value=name;document.getElementById('mKcal').value=k;document.getElementById('mProt').value=p;document.getElementById('mCarb').value=c;document.getElementById('mFat').value=f;document.getElementById('mFiber').value=fi;addMeal()}
;function planData(p){const base=p==='A'?A:B;if(!PulseContext.returnPolicy(db,key()))return base;return base.filter(x=>!/^Trizepsmaschine|^Bauchmaschine/.test(x[0])).map(x=>[x[0],x[1].replace(/^\d+/, '2'),x[2],'2:00',x[4]])}
function setCount(spec){let m=String(spec).match(/^(\d+)/);return m?+m[1]:3}
function repRange(spec){let m=String(spec).match(/(\d+)\s*[–-]\s*(\d+)/);return m?[+m[1],+m[2]]:[8,12]}
function pauseSeconds(x){let m=String(x).match(/(\d+):(\d+)/);return m?+m[1]*60 + +m[2]:90}
function numericStart(x){let n=parseFloat(String(x).replace(',','.'));return Number.isFinite(n)?n:''}
function exerciseHistory(name,plan){return db.workouts.filter(w=>w.exercise===name&&w.plan===plan)}

let restInterval=null,restEnds=0;function startRestTimer(sec,name){clearInterval(restInterval);restEnds=Date.now()+sec*1000;document.getElementById('restTimer').classList.add('on');document.getElementById('restFor').textContent=name+' · nächste Runde';tickRest();restInterval=setInterval(tickRest,500)}function tickRest(){let left=Math.max(0,Math.ceil((restEnds-Date.now())/1000)),m=Math.floor(left/60),s=left%60;document.getElementById('restTime').textContent=String(m).padStart(2,'0')+':'+String(s).padStart(2,'0');if(!left){clearInterval(restInterval);restInterval=null;document.getElementById('restFor').textContent='Pause vorbei · nächster Satz';}}function addTimer(sec){restEnds+=sec*1000;tickRest()}function stopTimer(){clearInterval(restInterval);restInterval=null;document.getElementById('restTimer').classList.remove('on')}

function finishWorkout(){let p=window.workoutPlan||(db.activeWorkout&&db.activeWorkout.date===key()?db.activeWorkout.plan:null)||activePlan()||'A',sets=db.workouts.filter(x=>x.date===key()&&x.plan===p);if(!sets.length)return toast('Noch keine Sätze gespeichert');if(today().workout!==p){today().workout=p;today().workoutFinishedAt=new Date().toISOString();addEvent({id:uid('training-completed'),type:'gym-training-completed',date:key(),plan:p,title:'Training '+p+' abgeschlossen',setCount:sets.length,source:'user',confidence:'confirmed',recordedAt:today().workoutFinishedAt,status:'completed'})}db.activeWorkout=null;stopTimer();save();showWorkout(p);requestAnimationFrame(()=>document.getElementById('workoutSummaryTitle')?.focus());toast('Workout abgeschlossen · '+sets.length+' Sätze gespeichert')}


function removeMeal(i){
 let m=db.meals[i];if(!m||m.date!==key())return;
 pushUndo({type:'meal-delete',meal:JSON.parse(JSON.stringify(m)),index:i});
 let d=today();d.kcal=Math.max(0,d.kcal-m.kcal);d.protein=Math.max(0,d.protein-m.protein);d.carbs=Math.max(0,d.carbs-m.carbs);d.fat=Math.max(0,d.fat-m.fat);d.fiber=Math.max(0,d.fiber-m.fiber);d.meals=Math.max(0,d.meals-1);
 db.meals.splice(i,1);save();toast('Mahlzeit entfernt','Rückgängig')
}


function renderWorkoutStats(){let todaySets=db.workouts.filter(x=>x.date===key());document.getElementById('sessionVolume').textContent=todaySets.reduce((a,x)=>a+x.volume,0);document.getElementById('sessionSets').textContent=todaySets.length;document.getElementById('sessionPR').textContent=todaySets.filter(x=>x.pr).length;const rated=todaySets.filter(x=>Number(x.rpe)>0);document.getElementById('sessionRPE').textContent=rated.length?(rated.reduce((a,x)=>a+x.rpe,0)/rated.length).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1}):'—';document.getElementById('progressionTips').innerHTML=['Anstrengung bestätigen, bevor du das Gewicht erhöhst','<8 saubere Wdh. → Gewicht reduzieren','Neue Maschine → leicht starten, dann hoch','2 Sessions Plateau → Schlaf/Essen prüfen'].map(x=>`<div class="item">${x}</div>`).join('')}
function renderCoach(){document.getElementById('coachMain').innerHTML=coachItems().map(x=>'<div class="item"><span class="dot"></span><div class="grow">'+x+'</div></div>').join('');document.getElementById('supplements').innerHTML=db.supplements.slice().reverse().map(x=>'<div class="item"><div class="grow"><b>'+esc(x.name)+'</b><div class="muted">'+esc(x.dose)+' · '+esc(x.time)+(x.note?' · '+esc(x.note):'')+'</div></div></div>').join('')||'<div class="empty">Noch nichts eingetragen.</div>';document.getElementById('cycleLog').innerHTML=db.cycles.slice().reverse().map(x=>'<div class="item"><div class="grow"><b>'+esc(x.date)+' · Tag '+esc(x.day??'—')+'</b><div class="muted">'+esc(x.phase)+(x.symptoms?' · '+esc(x.symptoms):'')+'</div></div></div>').join('')||'<div class="empty">Optional – noch kein Log.</div>'}function addSupplement(){let n=document.getElementById('sName').value;if(!n)return;db.supplements.push({date:key(),name:n,dose:document.getElementById('sDose').value,time:document.getElementById('sTime').value,note:document.getElementById('sNote').value});['sName','sDose','sTime','sNote'].forEach(id=>document.getElementById(id).value='');save();toast('Supplement gespeichert')}function saveCycle(){let day=+document.getElementById('cyDay').value;if(!day)return;db.cycles.push({date:key(),day,phase:document.getElementById('cyPhase').value,symptoms:document.getElementById('cySymptoms').value,note:document.getElementById('cyNote').value});save();toast('Zyklus-Log gespeichert')}function exportData(){PulseStorageUI.download(storage.exportText(db,{wrapped:false}),'pulse-export-'+key()+'.json');toast('Export erstellt')}

function patternInsights(){
 let out=[], dates=Object.keys(db.days).sort();
 let rec=dates.map(k=>({k,d:db.days[k]})).filter(x=>x.d.recovery);
 if(rec.length>=5){
   let low=rec.filter(x=>+x.d.recovery.sleep<7), hi=rec.filter(x=>+x.d.recovery.sleep>=7);
   let avg=a=>a.length?a.reduce((s,x)=>s+(recoveryScore(x.d.recovery)||0),0)/a.length:null;
   if(low.length>=2&&hi.length>=2){let a=avg(low),b=avg(hi);if(b-a>=8)out.push({t:'Schlaf × Readiness',x:'An Tagen mit mindestens 7 h Schlaf lag dein Recovery-Score im Mittel '+Math.round(b-a)+' Punkte höher.',n:rec.length});}
 }
 let cyc=dates.map(k=>({k,d:db.days[k]})).filter(x=>x.d.cycleContext&&+x.d.cycleContext.audhs>0);
 if(cyc.length>=3){let vals=cyc.map(x=>+x.d.cycleContext.audhs);let av=vals.reduce((a,b)=>a+b,0)/vals.length;if(av>=6)out.push({t:'Zyklus × AuDHS',x:'In '+cyc.length+' erfassten Zyklus-Tagen lag deine gemeldete AuDHS-Belastung im Mittel bei '+Number(av).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+'/10. Das ist eine Beobachtung aus deinen Einträgen, keine Ursache-Wirkungs-Aussage.',n:cyc.length});}
 let prots=dates.slice(-14).map(k=>db.days[k]).filter(Boolean); if(prots.length>=7){let hit=prots.filter(d=>d.protein>=110).length;if(hit>=4)out.push({t:'Protein-Konstanz',x:'An '+hit+' von '+prots.length+' erfassten Tagen lagst du bei mindestens 110 g Protein.',n:prots.length});}
 return out;
}
function renderPatterns(){
 let el=document.getElementById('patternList');if(!el)return;let p=patternInsights();el.innerHTML=p.length?p.map(x=>'<div class="pattern"><b>'+esc(x.t)+'</b><div>'+esc(x.x)+'</div><div class="confidence">Basis: '+x.n+' eigene Einträge</div></div>').join(''):'<div class="emptyquiet">Noch nicht genug eigene Daten für belastbare persönliche Muster. PULSE wartet lieber, als etwas zu erfinden.</div>';
 let r=document.getElementById('recompSummary');if(r){let body=db.body.slice().sort((a,b)=>a.date.localeCompare(b.date));let first=body[0],last=body[body.length-1],w=db.workouts.slice(-40);let items=[];if(first&&last&&first!==last&&first.waist&&last.waist)items.push('Taille: '+de(first.waist)+' → '+de(last.waist)+' cm ('+Number(((+last.waist)-(+first.waist))).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' cm)');items.push('Geloggte Sätze zuletzt: '+w.length);items.push('PRs in diesem Ausschnitt: '+w.filter(x=>x.pr).length);r.innerHTML=items.map(x=>'<div class="item">'+esc(x)+'</div>').join('')||'<div class="emptyquiet">Körperdaten und Trainingsverlauf füllen diese Zusammenfassung automatisch.</div>'}
}
async function exportPulse(){
 db.settings.lastExportAt=new Date().toISOString();save();
 let text=storage.exportText(db),n=0;
 try{const photos=await PulsePhotos.exportAll();n=Object.keys(photos).length;if(n){const o=JSON.parse(text);o.photos=photos;text=JSON.stringify(o)}}catch(_){toast('Fotos konnten nicht mitgesichert werden. Die Einträge sind im Backup.')}
 PulseStorageUI.download(text,'PULSE_backup_'+key()+'.json');toast(n?'Backup gesichert · mit '+n+(n===1?' Foto':' Fotos'):'Backup gesichert');renderLife();
}
function importPulse(file){
 if(!file)return;const reader=new FileReader();
 reader.onerror=()=>toast('Backup konnte nicht gelesen werden');
 reader.onload=async()=>{try{
  let text=reader.result,photos=null;
  try{const o=JSON.parse(text);if(o&&o.photos&&typeof o.photos==='object'){photos=o.photos;delete o.photos;text=JSON.stringify(o)}}catch(_){}
  storage.prepareImport(text);
  if(!confirm('Dieses Backup in PULSE laden? Der aktuelle Stand wird vorher gesichert und danach ersetzt.'))return;
  if(photos)await PulsePhotos.importAll(photos);
  const restored=storage.restore(text,db);db=restored;location.reload();
 }catch(error){PulseStorageUI.unsaved(error,{exportCurrent:()=>PulseStorageUI.download(storage.exportText(db),'PULSE_offene_Aenderungen_'+key()+'.json'),retry:()=>save()});toast(error.message)}};
 reader.readAsText(file);
}

// ---- PULSE 5.2 semantic memory layer ----
function foodProvenanceLabel(m){
 const p=m.provenance||m.source||'estimated';
 return ({exact:'exakt',label:'Etikett',saved:'gespeichert',calculated:'berechnet',
          estimated:'geschätzt',unclear:'unklar',user:'Nutzerangabe'}[p]||p);
}

// ---- PULSE 6.0 foundation: canonical event stream + low-friction intelligence ----
function uid(prefix='p'){return prefix+'-'+Date.now().toString(36)+'-'+(globalThis.crypto?.randomUUID?.().slice(0,8)||Math.random().toString(36).slice(2,10))}
function emit(type,payload={},meta={}){
 const e={id:uid('evt'),type,date:key(),at:new Date().toISOString(),source:'pulse',confidence:'confirmed',...meta,payload};
 db.timeline.push(e); if(db.timeline.length>1000)db.timeline=db.timeline.slice(-1000); return e;
}
function rememberCapture(raw,result){
 db.captureHistory.push({id:uid('cap'),raw,date:key(),at:new Date().toISOString(),result});
 if(db.captureHistory.length>250)db.captureHistory=db.captureHistory.slice(-250);
}
function findMealTemplate(raw){
 const low=raw.toLowerCase();
 if(/skyr.*(wie immer|normal|standard)|mein(?:en|e)?\s+skyr/i.test(low))
   return {text:'150 g Skyr, 30 g Sportness Whey, 150 g Himbeeren',label:'deine Standard-Skyr-Bowl'};
 if(/quark.*(wie immer|standard)/i.test(low))
   return {text:'250 g Magerquark, 100 g Himbeeren',label:'deine Standard-Quark-Bowl'};
 return null;
}

function pushUndo(x){db.undoStack.push(x);if(db.undoStack.length>20)db.undoStack=db.undoStack.slice(-20)}
function undoLast(){
 const u=db.undoStack.pop();if(!u)return toast('Nichts zum Rückgängigmachen');
 if(u.type==='life')return undoLife(u);
 if(u.type==='videos')return undoVideos(u);
 if(u.type==='magic')return undoMagic(u);
 if(u.type==='songs')return undoSongs(u);
 if(u.type==='drink'||u.type==='drink-delete')return undoDrink(u);
 if(u.type==='meal'){
   const i=db.meals.findIndex(x=>x.id===u.id);if(i>=0){
     const m=db.meals[i],d=db.days[m.date];
     if(d){d.kcal=Math.max(0,d.kcal-m.kcal);d.protein=Math.max(0,d.protein-m.protein);d.carbs=Math.max(0,d.carbs-m.carbs);d.fat=Math.max(0,d.fat-m.fat);d.fiber=Math.max(0,d.fiber-m.fiber);d.meals=Math.max(0,d.meals-1)}
     if(m.captureKey){const entry=brainEntries().find(e=>e.key===m.captureKey);if(entry){entry.record.done=false;entry.record.status='current';entry.record.completedAt=null}}
     db.meals.splice(i,1);emit('meal.undo',{mealId:u.id},{source:'user'});save();toast('Letzten Essenseintrag rückgängig gemacht');
   }
 }
 if(u.type==='meal-delete'){
   const m=u.meal,d=db.days[m.date]||today();
   db.meals.splice(Math.min(u.index,db.meals.length),0,m);
   d.kcal+=(m.kcal||0);d.protein+=(m.protein||0);d.carbs+=(m.carbs||0);d.fat+=(m.fat||0);d.fiber+=(m.fiber||0);d.meals=(d.meals||0)+1;
   emit('meal.restore',{mealId:m.id||null},{source:'user'});save();toast('Mahlzeit wiederhergestellt');
 }
}


function universalCapture(raw){
 raw=(raw||'').trim(); if(!raw)return {ok:false,message:'Nichts erfasst.'};
 const i=interpretCapture(raw);
 if(i.type==='food'||i.type==='drink'){
   const meal=directIntakeCapture(raw);
   if(meal){const r={ok:true,type:meal.kind==='drink'?'drink':'food',message:intakeMessage(meal)};rememberCapture(raw,r);save();return r}
   const entry={id:uid('i'),date:key(),text:raw,type:i.type==='drink'?'drink-capture':'food-capture',done:false,source:'capture',confidence:'unclear',recordedAt:new Date().toISOString(),status:'current'};db.inbox.push(entry);pendingFoodCapture='inbox:'+entry.id;
   const r={ok:true,type:'food-review',message:'Welche Menge war es? Ergänze sie kurz zum Prüfen.'};rememberCapture(raw,r);save();return r;
 }
 if(i.type==='workout'){
   const w=parseWorkoutCapture(raw);
   if(w.exercise&&w.kg!==null&&w.reps!==null){
     db.inbox.push({id:uid('i'),text:raw,type:'workout-set',parsed:w,done:false,date:key(),createdAt:new Date().toISOString(),recordedAt:new Date().toISOString(),source:'capture',status:'current',confidence:'derived'});
     emit('workout.capture',{...w,raw},{source:'capture',confidence:'derived'});
     const r={ok:true,type:'workout',message:`${w.exercise}: ${w.kg} kg × ${w.reps} erkannt · zur Prüfung in BRAIN gespeichert.`};rememberCapture(raw,r);save();return r;
   }
 }
 const r=executeCapture(raw);emit('capture.processed',{raw,result:r},{source:'capture',confidence:r.type==='note'?'unclear':'derived'});save();return r;
}

// Shared context helpers.

function remainingProtein(date=key()){
 const d=db.days[date]||{}; const target=Number(currentFact?.('goal','protein')?.value||120);
 return Math.max(0,Math.round(target-Number(d.protein||0)));
}

function openCaptureWith(v=''){
 openCapture();
 const ta=document.getElementById('captureText');
 if(ta){ta.value=v;setTimeout(()=>ta.focus(),30)}
}

let pendingValueSave=null, deferredInstallPrompt=null;
const VIEW_TITLES={life:'Dein Tag',spaces:'Lebensräume',library:'Sammlung',focus:'Fokus',calendar:'Kalender',videos:'Videos',sigils:'Sigillen',sky:'Dein Himmel',songs:'Song-Werkstatt',bodyhub:'Körper',workout:'Training',nutrition:'Essen',recovery:'Recovery',trends:'Fortschritt',goals:'Ziele',history:'Verlauf',plan:'Plan',coach:'Muster',mehub:'Ich'};
let lastDialogTrigger=null,activeDialog=null,dialogBackPending=false,queuedDialogNavigation=null;
function reducedMotion(){return window.matchMedia?.('(prefers-reduced-motion: reduce)').matches}

function navigateUp(parent){goView(parent,{historyMode:'replace'})}
function backgroundInert(on){document.querySelectorAll('#appMain,#bottomNav,#captureAccessory,#lifeNav,#lifeTopbar,#lifeLegacyBack').forEach(el=>{if(el)el.inert=on});document.body.classList.toggle('modalOpen',on)}
function openDialog(wrapper,focusSelector,{fromHistory=false}={}){
 const replacing=activeDialog!==null;
 if(!replacing)lastDialogTrigger=document.activeElement;
 else if(activeDialog!==wrapper.id)document.getElementById(activeDialog)?.classList.remove('open');
 activeDialog=wrapper.id;wrapper.classList.add('open');backgroundInert(true);
 if(!fromHistory&&!dialogBackPending){const state={pulseView:(location.hash||'#now').slice(1),pulseDialog:wrapper.id};if(replacing)history.replaceState(state,'',location.hash);else history.pushState(state,'',location.hash)}
 requestAnimationFrame(()=>{if(activeDialog!==wrapper.id)return;const el=wrapper.querySelector(focusSelector)||wrapper.querySelector('button,input,textarea,select,[tabindex]:not([tabindex="-1"])');el?.focus()});
}
function closeDialog(wrapper,{fromHistory=false,navigating=false}={}){
 if(!wrapper||activeDialog!==wrapper.id)return;
 pulseStopDictation();stopScanner();
 wrapper.classList.remove('open');activeDialog=null;backgroundInert(false);
 const f=lastDialogTrigger;lastDialogTrigger=null;
 if(!navigating&&f&&document.contains(f))requestAnimationFrame(()=>f.focus());
 if(!fromHistory&&!navigating&&history.state?.pulseDialog===wrapper.id){dialogBackPending=true;history.back()}
}
function openCapture(){pendingFoodCapture=null;document.getElementById('captureFollowup').hidden=true;document.getElementById('captureSubmit').hidden=false;document.getElementById('captureAmount').value='';openDialog(document.getElementById('captureSheet'),'#captureText');previewCapture()}
function closeCapture(){closeDialog(document.getElementById('captureSheet'))}
function captureHint(t){let e=document.getElementById('captureText');e.value=t;e.focus();e.setSelectionRange(e.value.length,e.value.length);pendingFoodCapture=null;document.getElementById('captureFollowup').hidden=true;document.getElementById('captureSubmit').hidden=false;previewCapture()}

function openValueEditor(title,label,value,step,onSave){
 pendingValueSave=onSave;let m=document.getElementById('valueModal');
 if(!m){m=document.createElement('div');m.id='valueModal';m.className='modal';m.innerHTML='<div class="modalbox" role="dialog" aria-modal="true" aria-labelledby="valueLabel"><div class="row"><div><div class="k" id="valueTitle"></div><div class="h2" id="valueLabel"></div></div><button type="button" class="small" aria-label="Dialog schließen" onclick="closeValueEditor()">×</button></div><label class="srOnly" for="valueInput">Wert</label><input id="valueInput" aria-labelledby="valueLabel" inputmode="decimal" type="number"><div class="actions"><button type="button" class="primary" onclick="commitValueEditor()">Speichern</button><button type="button" class="small" onclick="closeValueEditor()">Abbrechen</button></div></div>';document.body.appendChild(m)}
 document.getElementById('valueTitle').textContent=title;document.getElementById('valueLabel').textContent=label;let i=document.getElementById('valueInput');i.step=step||'1';i.value=value;openDialog(m,'#valueInput')
}
function closeValueEditor(){const m=document.getElementById('valueModal');if(m)closeDialog(m);pendingValueSave=null}
function commitValueEditor(){let v=document.getElementById('valueInput').value,fn=pendingValueSave;closeValueEditor();if(fn)fn(v)}


document.addEventListener('keydown',e=>{
 const wrapper=document.querySelector('.captureSheet.open,.modal.open');if(!wrapper)return;
 const dialog=wrapper.querySelector('[role="dialog"]');if(!dialog)return;
 if(e.key==='Escape'){e.preventDefault();if(wrapper.id==='captureSheet')closeCapture();else if(wrapper.id==='valueModal')closeValueEditor();return}
 if(e.key==='Tab'){
   const items=[...dialog.querySelectorAll('button:not([disabled]),input:not([disabled]):not([type="hidden"]),textarea:not([disabled]),select:not([disabled]),[href],[tabindex]:not([tabindex="-1"])')].filter(x=>x.offsetParent!==null);
   if(!items.length)return;const first=items[0],last=items[items.length-1];
   if(e.shiftKey&&document.activeElement===first){e.preventDefault();last.focus()}else if(!e.shiftKey&&document.activeElement===last){e.preventDefault();first.focus()}
 }
});
window.addEventListener('popstate',event=>{
 if(typeof overlayPop==='function'&&overlayPop())return;
 if(dialogBackPending){dialogBackPending=false;if(activeDialog)history.pushState({pulseView:(location.hash||'#now').slice(1),pulseDialog:activeDialog},'',location.hash);if(queuedDialogNavigation){const queued=queuedDialogNavigation;queuedDialogNavigation=null;goView(queued.v,queued.options)}return}
 const wasDialog=!!activeDialog;
 if(activeDialog)closeDialog(document.getElementById(activeDialog),{fromHistory:true});
 const destination=(location.hash||'#now').slice(1);
 if(!wasDialog||document.getElementById('appMain').dataset.view!==destination)goView(destination,{historyMode:false,focus:!wasDialog&&!event?.state?.pulseDialog});
 const id=event?.state?.pulseDialog;
 if(['captureSheet','valueModal','lifeSheet'].includes(id)){const wrapper=document.getElementById(id);if(wrapper)openDialog(wrapper,'input,textarea,button,[tabindex]',{fromHistory:true})}
});

window.addEventListener('beforeinstallprompt',e=>{e.preventDefault();deferredInstallPrompt=e;let b=document.getElementById('installPulse');if(b)b.hidden=false;renderLife()});
window.addEventListener('appinstalled',()=>{deferredInstallPrompt=null;requestDurableStorage();renderLife();toast('PULSE ist jetzt als App installiert')});
async function installPulse(){if(!deferredInstallPrompt)return toast('Installation ist über HTTPS oder localhost verfügbar.');deferredInstallPrompt.prompt();await deferredInstallPrompt.userChoice;deferredInstallPrompt=null;renderLife();let b=document.getElementById('installPulse');if(b)b.hidden=true}


render();showWorkout((db.activeWorkout&&db.activeWorkout.date===key()?db.activeWorkout.plan:null)||activePlan()||'A');goView(lifeStartView(location.hash),{historyMode:'replace',focus:false});
if('scrollRestoration' in history)history.scrollRestoration='manual';
for(const ev of ['load','pageshow'])addEventListener(ev,()=>{scrollTo(0,0);setTimeout(()=>scrollTo(0,0),60)});
if('serviceWorker' in navigator&&/^https?:$/.test(location.protocol)){
 const hadController=!!navigator.serviceWorker.controller;let reloading=false;
 navigator.serviceWorker.register('./sw.js',{updateViaCache:'none'}).then(reg=>{const check=()=>reg.update().catch(()=>{});document.addEventListener('visibilitychange',()=>{if(!document.hidden)check()});setInterval(check,30*60000)}).catch(()=>{});
 // A new version took over: reload once, but never while something is being typed or a sheet is open.
 navigator.serviceWorker.addEventListener('controllerchange',()=>{if(!hadController||reloading)return;const busy=activeDialog||document.activeElement?.matches?.('input,textarea,select');if(busy){toast('PULSE wurde aktualisiert. Beim nächsten Öffnen siehst du die neue Version.');return}reloading=true;location.reload()});
}
document.querySelectorAll('.life-mic').forEach(b=>b.hidden=!pulseSpeechSupported());
handleLaunchParams();requestDurableStorage();
setTimeout(()=>PulsePhotos.collect(photoReferences()).catch(()=>{}),4000);


document.addEventListener('input',event=>{if(event.target?.id)dirtyInputs.add(event.target.id);rememberWorkoutInput(event.target)});
let renderedDay=key();
function refreshLocalDay(){if(key()!==renderedDay){renderedDay=key();dirtyInputs.clear();pendingWorkoutCapture=null;pendingFoodCapture=null;render();showWorkout(activePlan()||'A')}}
window.addEventListener('focus',refreshLocalDay);
document.addEventListener('visibilitychange',()=>{if(!document.hidden)refreshLocalDay()});
setInterval(refreshLocalDay,60000);
