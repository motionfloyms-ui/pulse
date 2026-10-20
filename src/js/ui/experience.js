// SOURCE: ui/experience.js
/* PULSE 9 presentation and interactions. All decisions use the canonical engine. */
function uiIcon(name) {
  return '<svg class="icon" aria-hidden="true" focusable="false"><use href="#i-'+name+'"></use></svg>';
}
function renderAuraHome() {
  const d=today(),context=pulseContext(),training=context.training;
  document.getElementById('homeProtein').textContent=Math.round(d.protein||0)+' g';
  document.getElementById('homeWater').textContent=Number(d.water||0).toLocaleString('de-DE',{minimumFractionDigits:1,maximumFractionDigits:1})+' L';
  document.getElementById('homeTraining').textContent=training?.completed?'Erledigt':training?.kind==='home'?'Heimtraining':training?'Plan '+training.plan:'Nach Kapazität';
  document.getElementById('bodyPlan').textContent=context.mode==='recovery'?'Erholungstag':training?.completed?'Training erledigt':training?.kind==='home'?'Heimtraining heute':training?'Plan '+training.plan+' heute':'Heute kein Training';
  document.getElementById('bodyPlanDetail').textContent=context.mode==='recovery'?'Training und Schrittziel pausieren heute.':training?.kind==='home'?'Nach der Einheit als erledigt eintragen.':context.returnPolicy?'Wiedereinstieg: 2 Sätze pro Übung, RPE 6–7.':'Glutes, Schultern, Rücken. Letzte Gewichte sind vorausgefüllt.';
}
function openTodaysTraining() {
  const context=pulseContext();
  if(context.mode==='recovery')return goView('recovery');
  if(context.training?.kind==='home')return goView('plan');
  goView('workout');showWorkout(context.training?.plan||window.workoutPlan||'A');
}
function renderExperience() {
  const mode=effectiveMode();
  document.querySelectorAll('[data-capacity]').forEach(button=>button.setAttribute('aria-pressed',String(button.dataset.capacity===mode)));
  document.getElementById('capacityExplanation').textContent=mode==='recovery'
    ?'Training und Schrittziel pausieren heute.'
    :mode==='low'?'Reduzierter Tag: nur das Nötigste.'
    :'Normaler Tag.';
  document.getElementById('planRhythm').innerHTML=PulseContext.mealSlots(key()).map(slot=>
    '<div class="rhythm-row"><time>'+slot.time+'</time><b>'+esc(slot.label)+'</b></div>'
  ).join('');
}
function renderSemanticMemory() {
  const labels={height:'Körpergröße',weight_start:'Historisches Startgewicht',calories:'Dein Energie-Richtwert',protein:'Dein Protein-Richtwert',calorie_floor:'Übergebene Untergrenze',steps:'Schritte an regulären Tagen',first_meal:'Erste Mahlzeit',warm_meal:'Warme Mahlzeit',dinner:'Abendessen',late_meal:'Geplante Spätmahlzeit',lights_out:'Schlafroutine'};
  const records=db.facts.filter(record=>currentFact(record.domain,record.key)?.id===record.id);
  const prominent=records.filter(record=>['first_meal','warm_meal','dinner','late_meal'].includes(record.key));
  const entry=record=>'<div class="memory-entry"><b>'+esc(labels[record.key]||record.key)+'</b><p>'+esc(typeof record.value==='object'?JSON.stringify(record.value):record.value)+(record.unit?' '+esc(record.unit):'')+(record.key==='warm_meal'?' · Donnerstag 16:45':'')+'</p><small>'+(record.source==='user-correction'?'Von dir korrigiert':'Aus deinem gespeicherten Kontext')+(record.validFrom?' · seit '+esc(record.validFrom):'')+'</small></div>';
  document.getElementById('eventCount').textContent=records.length+' gültige Einträge';
  document.getElementById('semanticMemory').innerHTML=prominent.map(entry).join('')+
    '<details class="disclosure"><summary>Weitere gespeicherte Grundlagen</summary>'+records.filter(record=>!prominent.includes(record)).map(entry).join('')+'</details>';
}
// Capture preview is read-only. A click is required before processing or saving.
function previewCapture() {
  const raw=document.getElementById('captureText').value.trim();
  const result=raw?interpretCapture(raw):null;
  const names={task:'Aufgabe',food:'Essen',drink:'Getränk',workout:'Training zur Prüfung',recovery:'Heutige Recovery',context:'Heutiger Kontext','context-clear':'Aktualisierter Tageskontext','historical-review':'Vergangenes Datum prüfen',note:'Gedanke'};
  document.getElementById('captureHint').textContent=result
    ?(names[result.type]||'Eintrag')+(result.due?' · '+result.due:'')+' · noch nicht gespeichert'
    :'Ein Satz reicht. Bei fehlenden Angaben fragt PULSE nach.';
}
function showFoodFollowup(raw) {
  document.getElementById('captureText').value=raw;
  document.getElementById('captureAmount').value='';
  const drink=interpretCapture(raw).type==='drink';
  document.getElementById('captureAmountLabel').textContent=drink?'Getränkemenge · ml oder l':'Fehlende Menge oder Portion';
  document.getElementById('captureAmount').placeholder=drink?'z. B. 250 ml oder 0,5 l':'z. B. 150 g';
  document.getElementById('captureHint').textContent=drink?'Wie viel war es? ml und Liter sind möglich. Nährwerte bleiben offen, wenn das Produkt unbekannt ist.':'Welche Menge war es? Dein Eintrag bleibt bis zur Klärung in Brain.';
  document.getElementById('captureFollowup').hidden=false;
  document.getElementById('captureSubmit').hidden=true;
  document.getElementById('captureAmount').focus();
}
function smartCapture() {
  const raw=document.getElementById('captureText').value.trim();
  if(!raw)return toast('Ein Satz reicht. Was möchtest du festhalten?');
  const result=universalCapture(raw);
  if(result.type==='food-review'){showFoodFollowup(raw);render();return}
  document.getElementById('captureText').value='';closeCapture();render();
  toast(result.message,['food','drink'].includes(result.type)?'Rückgängig':'');
}
function confirmCaptureFood() {
  const pending=brainEntries().find(item=>item.key===pendingFoodCapture&&!item.record.done&&item.record.date===key());
  if(!pending)return toast('Diese Prüfung ist nicht mehr offen. Dein Eintrag bleibt in Brain.');
  const raw=document.getElementById('captureText').value.trim(),amount=document.getElementById('captureAmount').value.trim();
  if(!['food','drink'].includes(interpretCapture(raw).type))return toast('Du hast die Art des Eintrags geändert. Schließe ihn und erfasse den neuen Text.');
  const text=raw+(amount?' '+amount:''),meal=directIntakeCapture(text);
  if(!meal){document.getElementById('captureHint').textContent=interpretCapture(raw).type==='drink'?PulseDrinks.parse(text,allFoods()).reason:'Noch nicht eindeutig. Bitte Lebensmittel und Menge ergänzen, zum Beispiel „150 g Skyr“.';return}
  const entry=brainEntries().find(item=>item.key===pendingFoodCapture);
  if(entry){meal.captureKey=entry.key;entry.record.done=true;entry.record.status='completed';entry.record.completedAt=new Date().toISOString()}
  pendingFoodCapture=null;save();document.getElementById('captureText').value='';closeCapture();render();toast(intakeMessage(meal),'Rückgängig');
}
function renderSmartPreview() {
  const box=document.getElementById('smartFoodPreview'),draft=window.smartDraft;
  if(!draft){box.innerHTML='';return}
  const known=draft.parts.filter(part=>!part.unknown),unknown=draft.parts.filter(part=>part.unknown);
  const sum={kcal:0,protein:0,carbs:0,fat:0,fiber:0};
  for(const part of known)for(const nutrient of Object.keys(sum))sum[nutrient]=nums(sum[nutrient]+(part.nut[nutrient]||0));
  draft.known=known;draft.unknown=unknown;draft.sum=sum;
  box.innerHTML='<div class="note"><b>'+(unknown.length?'Eine Angabe fehlt noch.':'So habe ich es verstanden.')+'</b>'+known.map(part=>'<p>'+esc(part.food.name)+' · '+esc(part.label)+'</p>').join('')+
    unknown.map(part=>'<p><b>'+esc(part.raw)+'</b><br>'+esc(part.reason||'Bitte die Menge oder das Lebensmittel präzisieren.')+(part.food?'':(n=>'<br><span class="food-missing-actions"><button type="button" class="life-textbtn" onclick="'+lifeCall('lifeFoodSearch',n)+'">Online suchen</button><button type="button" class="life-textbtn" onclick="'+lifeCall('lifeFoodEditor',null,{name:n})+'">Selbst anlegen</button></span>')(part.raw.replace(/[\d.,]+\s*(g|ml|stück|x)?\b/gi,'').replace(/\s+/g,' ').trim()))+'</p>').join('')+
    (known.length?'<p>'+Math.round(sum.kcal)+' kcal · '+de(sum.protein)+' g Protein'+(known.some(part=>part.confidence==='geschaetzt')?' · geschätzt':'')+'</p>':'')+
    '<div class="actions"><button type="button" class="primary" onclick="saveSmartFood()" '+(unknown.length||!known.length?'disabled':'')+'>Mahlzeit eintragen</button><button type="button" class="text-button" onclick="clearSmartFood()">Verwerfen</button></div></div>';
}
function renderNutrition() {
  const d=today();
  for(const [id,value] of [['nKcal',Math.round(d.kcal)],['nProt',de(d.protein)+' g'],['nCarb',de(d.carbs)+' g'],['nFat',de(d.fat)+' g']])document.getElementById(id).textContent=value;
  document.getElementById('mealList').innerHTML=db.meals.filter(meal=>meal.date===key()).slice().reverse().map(meal=>
    '<div class="item mealItem"><div class="grow"><small>'+esc(meal.time||'Zeit offen')+'</small><b>'+esc(meal.name)+'</b><div class="muted">'+de(meal.protein)+' g Protein · '+Math.round(meal.kcal)+' kcal'+(meal.confidence==='estimated'?' · geschätzt':'')+'</div></div><button type="button" class="icon-button danger" aria-label="'+esc(meal.name)+' löschen" onclick="removeMeal('+db.meals.indexOf(meal)+')">'+uiIcon('close')+'</button></div>'
  ).join('')||'<div class="empty">Noch keine Mahlzeiten heute.</div>';
  document.getElementById('macroBars').innerHTML='<div class="quiet-note">'+esc(nutritionNextAction())+'</div>';
  renderFoodToday();renderFoodLibrary();
}
function workoutDraftKey(plan,exercise,set){return key()+'|'+plan+'|'+exercise+'|'+set}
function workoutDraft(plan,exercise,set){return db.uiPrefs.workoutDrafts?.[workoutDraftKey(plan,exercise,set)]||{}}
function rememberWorkoutInput(target){
  const match=/^(kg|rep|rpe)-(\d+)-(\d+)$/.exec(target?.id||'');
  if(!match||!window.workoutPlan)return;
  const exercise=planData(window.workoutPlan)[Number(match[2])];if(!exercise)return;
  const id=workoutDraftKey(window.workoutPlan,exercise[0],Number(match[3])+1);
  db.uiPrefs.workoutDrafts=db.uiPrefs.workoutDrafts||{};
  db.uiPrefs.workoutDrafts[id]={...db.uiPrefs.workoutDrafts[id],[match[1]]:target.value};
  save();
}
function clearWorkoutDraft(plan,exercise,set){if(db.uiPrefs.workoutDrafts)delete db.uiPrefs.workoutDrafts[workoutDraftKey(plan,exercise,set)]}
function previousExerciseSession(name){const all=db.workouts.filter(w=>w.exercise===name&&w.date<key()).sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||a.set||0)-(b.ts||b.set||0));return all.length?all.filter(w=>w.date===all.at(-1).date):[]}
function workoutFocusPreference(plan){const p=db.uiPrefs.workoutFocus;return p?.date===key()&&p.plan===plan?p.index:undefined}
function setWorkoutView(mode){if(!['focus','overview'].includes(mode))return;db.uiPrefs.workoutView=mode;save();showWorkout(window.workoutPlan||activePlan()||'A')}
function selectWorkoutExercise(index){
  const plan=window.workoutPlan||activePlan()||'A';if(!Number.isInteger(index)||index<0||index>=planData(plan).length)return;
  db.uiPrefs.workoutFocus={date:key(),plan,index};save();showWorkout(plan);focusWorkoutHeading();
}
function focusWorkoutHeading(){requestAnimationFrame(()=>{const heading=document.getElementById('workoutFocusTitle');if(heading&&!document.getElementById('workoutFocus').hidden){heading.focus({preventScroll:true});heading.scrollIntoView?.({block:'start',behavior:reducedMotion()?'auto':'smooth'})}})}
function advanceWorkoutFocus(plan,index){
  const session=PulseSession.project(db,key(),plan,planData(plan),index);
  db.uiPrefs.workoutFocus={date:key(),plan,index:session.items[index].done?PulseSession.nextPending(session,index):index};
}
function renderWorkoutSummary(plan,session){
  const box=document.getElementById('workoutSummary');box.hidden=!session.closed;
  if(!session.closed){box.innerHTML='';return}
  box.innerHTML='<div class="eyebrow">Training</div><h2 id="workoutSummaryTitle" tabindex="-1">Abgeschlossen</h2><p>'+session.records.length+' '+(session.records.length===1?'erfasster Satz':'erfasste Sätze')+' · '+session.exerciseCount+' '+(session.exerciseCount===1?'Übung':'Übungen')+' · Plan '+esc(plan)+'</p><div class="session-receipt">'+
    [...new Set(session.records.map(x=>x.exercise))].map(name=>'<div><b>'+esc(name)+'</b><span>'+session.records.filter(x=>x.exercise===name).map(x=>esc(x.kg)+' kg × '+esc(x.reps)).join(' / ')+'</span></div>').join('')+'</div><p class="tiny">'+(session.averageEffort===null?'Keine Anstrengung erfasst.':'Ø Anstrengung '+session.averageEffort+'/10 aus '+session.effortCount+' erfassten Angaben.')+' Du musst keine weiteren Sätze ergänzen.</p><div class="actions"><button type="button" class="primary" onclick="goView(\'now\')">Zurück zu Heute '+uiIcon('arrow')+'</button><button type="button" class="text-button" onclick="resumeWorkout()">Einheit weiterführen</button></div>';
}
function resumeWorkout(){
  const plan=window.workoutPlan||activePlan()||'A';
  reopenWorkoutCompletion(plan);
  db.activeWorkout={date:key(),plan,startedAt:Date.now()};save();showWorkout(plan);focusWorkoutHeading();
}
function reopenWorkoutCompletion(plan){
  if(today().workout!==plan)return;
  const at=new Date().toISOString();
  for(const event of db.events)if(event.type==='gym-training-completed'&&event.date===key()&&event.plan===plan&&event.status==='completed'){event.status='superseded';event.supersededAt=at}
  addEvent({id:uid('training-correction'),type:'gym-training-correction',date:key(),plan,title:'Trainingsabschluss zurückgenommen',source:'user',confidence:'confirmed',recordedAt:at,status:'historical'});
  delete today().workout;delete today().workoutFinishedAt;
  if(db.activeWorkout?.date!==key()||db.activeWorkout?.plan!==plan)db.activeWorkout={date:key(),plan,startedAt:Date.now()};
}
function showWorkout(plan,{exerciseIndex}={}) {
  if(!['A','B'].includes(plan))return;
  document.getElementById('waBtn').classList.toggle('active',plan==='A');
  document.getElementById('wbBtn').classList.toggle('active',plan==='B');
  document.getElementById('waBtn').setAttribute('aria-pressed',String(plan==='A'));
  document.getElementById('wbBtn').setAttribute('aria-pressed',String(plan==='B'));
  window.workoutPlan=plan;
  const exercises=planData(plan),sets=db.workouts.filter(set=>set.date===key()&&set.plan===plan);
  const session=PulseSession.project(db,key(),plan,exercises,exerciseIndex??workoutFocusPreference(plan)),current=session.current;
  const focus=db.uiPrefs.workoutView!=='overview';
  document.getElementById('workout').classList.toggle('training-focus',focus&&!session.closed);
  document.getElementById('workoutFocus').hidden=!focus||session.closed;
  document.getElementById('workoutViewFocus').setAttribute('aria-pressed',String(focus));
  document.getElementById('workoutViewOverview').setAttribute('aria-pressed',String(!focus));
  const item=session.items[current];
  document.getElementById('workoutFocusTitle').textContent=session.allDone?'Deine Sätze sind erfasst.':item.name;
  document.getElementById('workoutFocusPosition').textContent='Übung '+(current+1)+' von '+exercises.length+(item.done?' · Sätze erfasst':' · Satz '+(item.pending[0]+1)+' von '+item.count);
  document.getElementById('workoutFocusPrevious').disabled=current===0;
  document.getElementById('workoutFocusNext').disabled=current===exercises.length-1;
  document.getElementById('workoutFocusPrevious').onclick=()=>selectWorkoutExercise(current-1);
  document.getElementById('workoutFocusNext').onclick=()=>selectWorkoutExercise(current+1);
  document.getElementById('workoutFocusHint').textContent=session.allDone?'Du kannst deine Einheit jetzt abschließen.':item.done?'Für diese Übung sind die geplanten Sätze erfasst. Du kannst die Übung wechseln oder die Einheit abschließen.':'Gerät belegt? Wechsle die Übung mit den Pfeilen. Offene Sätze bleiben offen.';
  renderWorkoutSummary(plan,session);
  document.getElementById('workoutTable').hidden=session.closed;
  document.getElementById('workoutViewControls').hidden=session.closed;
  document.getElementById('workoutFinish').hidden=session.closed;
  document.getElementById('workoutStart').hidden=session.closed;
  document.getElementById('workoutStatus').textContent='Plan '+plan+' · '+sets.length+' Sätze gespeichert.'+(PulseContext.returnPolicy(db,key())?' Wiedereinstieg · zwei Arbeitssätze je Übung.':' Deine Anstrengung gibst du selbst an.');
  const guide=document.getElementById('returnTrainingGuide');guide.hidden=session.closed||!PulseContext.returnPolicy(db,key());
  document.getElementById('workoutTable').innerHTML=exercises.map((exercise,index)=>{
    const completed=sets.filter(set=>set.exercise===exercise[0]),count=setCount(exercise[1]),weight=suggestedWeight(exercise,plan),range=repRange(exercise[1]),history=previousExerciseSession(exercise[0]);
    const historyText=history.length?history[0].date+' · '+history.map(set=>de(set.kg)+' kg × '+set.reps+(set.rpe>0?' · RPE '+set.rpe:' · Anstrengung offen')).join(' / '):'Noch keine bestätigte Session für diese Übung.';
    const rows=Array.from({length:count},(_,setIndex)=>{
      const saved=completed.find(set=>set.set===setIndex+1),draft=workoutDraft(plan,exercise[0],setIndex+1);
      if(saved)return '<div class="setdone">'+uiIcon('check')+'<span>Satz '+(setIndex+1)+' · '+esc(saved.kg)+' kg × '+esc(saved.reps)+'</span><small>'+(saved.rpe>0?'RPE '+esc(saved.rpe):'Anstrengung offen')+'</small></div>';
      return '<div class="setgrid '+(setIndex===session.items[index].pending[0]?'next-set':'later-set')+'"><strong>Satz '+(setIndex+1)+'</strong><label>kg<input id="kg-'+index+'-'+setIndex+'" type="number" inputmode="decimal" step="0.5" min="0" value="'+esc(draft.kg??weight)+'"/></label><label>Wdh.<input id="rep-'+index+'-'+setIndex+'" type="number" inputmode="numeric" min="1" max="100" value="'+esc(draft.rep??'')+'" placeholder="'+range[0]+'–'+range[1]+'"/></label><label>RPE 1–10<input id="rpe-'+index+'-'+setIndex+'" type="number" inputmode="decimal" min="1" max="10" step="0.5" value="'+esc(draft.rpe??'')+'" placeholder="offen"/></label><button type="button" class="primary" onclick="completeSet('+index+','+setIndex+',\''+plan+'\')">Satz '+(setIndex+1)+' speichern '+uiIcon('check')+'</button></div>';
    }).join('');
    return '<details class="excard '+(index===current?'current':'')+'" '+(index===current?'open':'')+'><summary><span class="exercise-number">'+(index+1)+'</span><span class="grow"><b>'+esc(exercise[0])+'</b><small>'+esc(exercise[1])+' · '+esc(exercise[3])+' Pause</small></span><span class="badge">'+completed.length+'/'+count+'</span></summary><p class="exercise-history">Letzte Session: '+esc(historyText)+'</p>'+rows+'<p class="suggestion">'+esc(progressionText(exercise,plan))+'</p></details>';
  }).join('');
}
function recordedWeek() {return PulseProgress.week(db,key(),PulseContext.offset,PulseContext.score)}
function renderTrends() {
  const week=recordedWeek(),days=week.days,max=Math.max(8000,...days.map(day=>day.steps||0));
  document.getElementById('trendChart').innerHTML=days.map(day=>'<div class="col"><b class="tiny">'+(day.steps===null?'—':Math.round(day.steps/100)/10+'k')+'</b><i style="height:'+(day.steps===null?3:Math.max(3,day.steps/max*100))+'px"></i><span>'+new Date(day.date+'T12:00:00').toLocaleDateString('de-DE',{weekday:'short'})+'</span></div>').join('');
  document.getElementById('averages').innerHTML=[['kcal','kcal'],['protein','g Protein'],['steps','Schritte'],['readiness','Befinden /100']].map(([field,label])=>{
    const item=week.averages[field];return '<div><b>'+(item.value===null?'—':item.value)+'</b><small>'+label+' · Ø aus '+item.count+' erfassten Tagen</small></div>';
  }).join('');
  document.getElementById('trendTable').innerHTML=days.map(day=>'<tr>'+[day.date,day.kcal,day.protein,day.water,day.steps,day.sleep,day.readiness].map(value=>'<td>'+esc(value??'—')+'</td>').join('')+'</tr>').join('');
  const sets=db.workouts.filter(set=>set.date<=key()).slice().sort((a,b)=>a.date.localeCompare(b.date)||(a.ts||0)-(b.ts||0)).slice(-20);
  const total=sets.reduce((sum,set)=>sum+(Number(set.volume)||0),0);
  document.getElementById('loadSummary').innerHTML='<div class="big-number">'+total.toLocaleString('de-DE')+' kg</div><p class="muted">Volumen deiner letzten '+sets.length+' erfassten Sätze. Einzelne Einheiten sind kein Urteil.</p>';
}
function buildReport() {
  const week=recordedWeek(),labels={kcal:'kcal',protein:'g Protein',water:'L Wasser',steps:'Schritte',readiness:'Befinden /100'};
  document.getElementById('weeklyReport').innerHTML='<b>Deine erfasste Woche</b>'+Object.entries(labels).map(([field,label])=>{
    const item=week.averages[field];return '<p>'+label+': '+(item.value===null?'keine Daten':'Ø '+item.value+' aus '+item.count+' Tagen')+'</p>';
  }).join('')+'<p>Fehlende Einträge bleiben offen. Daraus entsteht keine Nachholaufgabe.</p>';
  toast('Rückblick aus deinen Einträgen erstellt');
}


