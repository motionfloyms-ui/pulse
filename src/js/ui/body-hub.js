// SOURCE: ui/body-hub.js
/* Körper in the same design as the Tag screen: training hero, food and water rings, quick actions,
   mood of the day, progress with a small line, four weeks of training, plans and recipes. */
const deDate=(d,o={day:'2-digit',month:'2-digit',year:'2-digit'})=>d&&/^\d{4}-\d{2}-\d{2}/.test(d)?new Date(d.slice(0,10)+'T12:00:00').toLocaleDateString('de-DE',o):(d||'—');
function bodySpark(values,w=120,h=36){
 if(values.length<2)return '';const min=Math.min(...values),max=Math.max(...values),span=max-min||1;
 const pts=values.map((v,i)=>(i/(values.length-1)*w).toFixed(1)+','+(h-3-(v-min)/span*(h-6)).toFixed(1)).join(' ');
 return '<svg class="body-spark" viewBox="0 0 '+w+' '+h+'" aria-hidden="true"><polyline points="'+pts+'"/><circle cx="'+w+'" cy="'+pts.split(' ').at(-1).split(',')[1]+'" r="3"/></svg>';
}
function bodyHero(){
 const c=pulseContext(),t=c.training,days=Array.from({length:7},(_,i)=>PulseContext.offset(key(),i-6)),n=days.filter(trainedOn).length;
 const title=c.mode==='recovery'?'Erholungstag':t?.completed?'Training erledigt':t?.kind==='home'?'Heimtraining heute':t?'Plan '+t.plan+' heute':'Heute kein Training';
 const detail=c.mode==='recovery'?'Training und Schrittziel pausieren heute.':t?.kind==='home'?'Nach der Einheit als erledigt eintragen.':PulseContext.returnPolicy(db,key())?'Wiedereinstieg: 2 Sätze pro Übung, RPE 6–7.':t?'Letzte Gewichte sind vorausgefüllt.':'Bewegung nach Lust: Spaziergang, Dehnen, Nordbahntrasse.';
 return '<section class="body-hero"><span class="life-kicker">Training</span><b>'+esc(title)+'</b><p>'+esc(detail)+'</p><span class="pulse-dots" aria-label="'+n+' Trainingstage in den letzten 7 Tagen">'+days.map(x=>'<i class="'+(trainedOn(x)?'on':'')+(x===key()?' today':'')+'"></i>').join('')+'</span><div class="body-hero-actions">'+lifeButton('Training öffnen','openTodaysTraining()','life-btn')+'<small>'+n+' von 7 Tagen</small></div></section>';
}
function bodyMood(){
 const m=effectiveMode(),r=today().recovery,label={normal:'Normaler Tag',low:'Wenig Energie',recovery:'Erholung'}[m]||'Normaler Tag';
 return '<button type="button" class="pulse-tile body-mood" onclick="goView(\'recovery\')"><span class="pulse-tile-head">Befinden</span><b class="pulse-tile-value">'+esc(label)+'</b><small>'+(r&&r.sleep?'Schlaf '+de(r.sleep)+' h':'Schlaf und Zyklus eintragen')+'</small></button>';
}
function bodyProgress(){
 const body=(db.body||[]).filter(x=>Number.isFinite(Number(x.waist))&&x.waist!==null&&x.waist!=='').sort((a,b)=>a.date.localeCompare(b.date)),last=body.at(-1),first=body[0];
 const delta=last&&first&&last!==first?Number(last.waist)-Number(first.waist):null;
 return '<button type="button" class="pulse-tile body-progress" onclick="goView(\'trends\')"><span class="pulse-tile-head">Taille</span><b class="pulse-tile-value">'+(last?de(last.waist)+' cm':'Noch nicht gemessen')+'</b>'+bodySpark(body.slice(-10).map(x=>Number(x.waist)))+'<small>'+(delta!=null?(delta<=0?'−':'+')+de(Math.abs(delta))+' cm seit '+deDate(first.date,{day:'numeric',month:'short'}):last?'am '+deDate(last.date,{day:'numeric',month:'short'}):'Fortschritt ansehen')+'</small></button>';
}
function bodyWeeks(){
 const days=Array.from({length:28},(_,i)=>PulseContext.offset(key(),i-27)),n=days.filter(trainedOn).length,first=days[0],offset=(new Date(first+'T12:00:00').getDay()+6)%7;
 return '<section class="body-weeks"><div class="life-row"><h2>Vier Wochen</h2><span class="life-subtle">'+n+' Trainingstage</span></div><div class="body-weeks-grid" role="img" aria-label="'+n+' Trainingstage in den letzten vier Wochen">'+['Mo','Di','Mi','Do','Fr','Sa','So'].map(d=>'<small>'+d+'</small>').join('')+Array(offset).fill('<i class="pad"></i>').join('')+days.map(d=>'<i class="'+(trainedOn(d)?'on':'')+(d===key()?' today':'')+'" title="'+esc(deDate(d,{weekday:'short',day:'numeric',month:'short'}))+'"></i>').join('')+'</div></section>';
}
function renderBodyHub(){
 const host=document.getElementById('bodyHubContent');if(!host||document.getElementById('appMain').dataset.view!=='bodyhub')return;
 const ret=!!PulseContext.returnPolicy(db,key());
 const plan=p=>'<details class="life-plan-details"><summary><b>Plan '+p+'</b><small>'+planData(p).length+' Übungen'+(ret?' · Wiedereinstieg':'')+'</small></summary>'+planData(p).map((x,i)=>{const last=previousExerciseSession(x[0]);return '<div class="life-plan-row"><span>'+(i+1)+'</span><div><b>'+esc(x[0])+'</b><small>'+esc(x[1])+' · '+esc(x[3])+' Pause'+(last.length?' · zuletzt '+esc(last.map(w=>de(w.kg)+'×'+w.reps).join(' / '))+' kg':'')+'</small></div></div>'}).join('')+'<button type="button" class="life-btn" onclick="goView(\'workout\');showWorkout(\''+p+'\')">Plan '+p+' öffnen</button></details>';
 host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Essen · Training · Erholung</span><h1>Körper</h1></header>'+bodyHero()+
  '<div class="pulse-bento body-bento">'+tileBody()+bodyMood()+bodyProgress()+'</div>'+
  '<div class="body-quick">'+[['＋ 250 ml','Wasser','addWater(.25)'],['Mahlzeit','eintragen','goView(\'nutrition\')'],['Barcode','scannen','goView(\'nutrition\');setTimeout(openFoodScanner,200)']].map(([b,s,c])=>'<button type="button" onclick="'+c+'"><b>'+b+'</b><small>'+s+'</small></button>').join('')+'</div>'+
  bodyWeeks()+
  '<div class="more-list body-routes">'+[['Essen & Trinken','Mahlzeiten, Getränke, eigene Lebensmittel','nutrition'],['Training','Sätze erfassen, Fokus oder alle Übungen','workout'],['Befinden & Zyklus','Tagesform, Schlaf, Zyklus','recovery'],['Fortschritt','Taille, Maße, Trainingsverlauf','trends']].map(([t,s,v])=>'<button type="button" class="cos-row" onclick="'+lifeCall('lifeLegacy',v)+'"><span><b>'+esc(t)+'</b><small>'+esc(s)+'</small></span><span class="more-arrow" aria-hidden="true">↗</span></button>').join('')+'</div>'+
  '<div class="life-sectionhead"><h2>Deine Trainingspläne</h2><span class="life-subtle">Mo · Mi · Fr</span></div>'+plan('A')+plan('B')+lifeLibSection('koerper');
}
