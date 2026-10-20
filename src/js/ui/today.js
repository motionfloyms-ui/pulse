// SOURCE: ui/today.js
/* Tag: an adaptive overview (tiles ordered by time of day), the day's agenda, and the one-line capture. */
function pulseTap(ms=12){try{navigator.vibrate?.(ms)}catch(_){}}
let lifeJustDone=null,lifeJustDoneAt=0;
function dayPeriod(h=new Date().getHours()){return h>=5&&h<11?'morning':h>=11&&h<18?'day':'evening'}
function ring(value,goal,label,unit){
 const p=goal?Math.max(0,Math.min(1,value/goal)):0,C=2*Math.PI*17;
 return '<span class="pulse-ring" role="img" aria-label="'+esc(label+': '+de(value)+(goal?' von '+de(goal):'')+' '+unit)+'"><svg viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="17" class="track"/><circle cx="22" cy="22" r="17" class="bar" stroke-dasharray="'+(C*p).toFixed(1)+' '+C.toFixed(1)+'"/></svg><span><b>'+de(value)+'</b><small>'+esc(label)+'</small></span></span>';
}
function trainedOn(d){const day=db.days[d]||{};return !!(day.workout||day.homeWorkoutCompleted||db.workouts.some(w=>w.date===d))}
function tileBody(){
 const d=today(),p=goalValue('protein'),w=Number(db.waterGoal)||2;
 return '<button type="button" class="pulse-tile span2 tile-body" onclick="goView(\'nutrition\')"><span class="pulse-tile-head">Essen &amp; Trinken</span><span class="pulse-rings">'+ring(Math.round(d.protein||0),p,'g Protein','g')+ring(Math.round((d.water||0)*100)/100,w,'L Wasser','L')+'<span class="pulse-tile-meta"><b>'+Math.round(d.kcal||0)+' kcal</b><small>'+(d.meals||0)+' '+((d.meals||0)===1?'Mahlzeit':'Mahlzeiten')+(p?' · Ziel '+p+' g Protein':'')+'</small></span></span></button>';
}
function tileTraining(){
 const c=pulseContext(),t=c.training,days=Array.from({length:7},(_,i)=>PulseContext.offset(key(),i-6));
 const status=c.mode==='recovery'?'Erholungstag':t?.completed?'Erledigt':t?.active?'Läuft':t?.kind==='home'?'Heimtraining':t?'Plan '+t.plan+' heute':'Kein Training';
 const n=days.filter(trainedOn).length;
 return '<button type="button" class="pulse-tile tile-training" onclick="openTodaysTraining()"><span class="pulse-tile-head">Training</span><b class="pulse-tile-value">'+esc(status)+'</b><span class="pulse-dots" aria-label="'+n+' Trainingstage in den letzten 7 Tagen">'+days.map(x=>'<i class="'+(trainedOn(x)?'on':'')+(x===key()?' today':'')+'" title="'+esc(lifeDate(x,{weekday:'short'}))+'"></i>').join('')+'</span><small>'+n+' von 7 Tagen</small></button>';
}
function nextUp(){
 const now=new Date(),hm=String(now.getHours()).padStart(2,'0')+':'+String(now.getMinutes()).padStart(2,'0'),items=PulseLife.day(db,key()).filter(x=>x.status!=='done');
 return items.find(x=>x.time&&x.time>=hm)||items.find(x=>!x.time)||null;
}
function tileNext(){
 const x=nextUp();
 if(!x)return '<button type="button" class="pulse-tile tile-next" onclick="lifeQuick()"><span class="pulse-tile-head">Als Nächstes</span><b class="pulse-tile-value">Nichts geplant</b><small>Termin oder Aufgabe hinzufügen</small></button>';
 return '<button type="button" class="pulse-tile tile-next" onclick="'+lifeCall('lifeOpenItem',x.id)+'"><span class="pulse-tile-head">'+(x.time?'Um '+esc(x.time):'Aufgabe heute')+'</span><b class="pulse-tile-value">'+esc(x.title)+'</b><small>'+esc(PulseLife.room(x.room).name)+'</small></button>';
}
function tileNight(){
 const m=PulseLibrary.moon(key()),card=libTodayCard();
 const tarot=card?'<button type="button" class="life-tonight-card picked" onclick="'+lifeCall('lifeTarotOpen',card.index)+'"><span class="life-mini-card">'+lifeGlyph('star')+'</span><b>'+esc(card.card.name)+'</b><small>Tageskarte</small></button>'
  :'<div class="life-tonight-card"><span class="life-mini-card back"></span><span class="life-today-actions">'+lifeButton('Karte ziehen',lifeCall('lifeDrawCard'),'life-textbtn')+lifeButton('Aus meinem Deck',lifeCall('lifeTarotBrowse','major',true),'life-textbtn')+'</span></div>';
 return '<section class="life-tonight span2" aria-label="Mond und Tageskarte"><button type="button" class="life-tonight-moon" onclick="'+lifeCall('lifeOpenSpaces','sinn')+'">'+moonSvg(m,52)+'<span><span class="life-kicker">Mond · '+m.illumination+' %</span><b>'+esc(m.name)+'</b><small>'+esc(moonLine(m))+'</small></span></button>'+tarot+'</section>';
}
function tileEvening(){return '<button type="button" class="pulse-tile tile-evening" onclick="'+lifeCall('lifeOpenLib','sinn-tagesabschluss')+'"><span class="pulse-tile-head">Abends</span><b class="pulse-tile-value">Tagesabschluss</b><small>Drei Sätze zum Tag</small></button>'}
function tileRecipe(){const r=PulseLibrary.daily(key(),'recipe','koerper');return r?'<button type="button" class="pulse-tile tile-recipe" onclick="'+lifeCall('lifeOpenLib',r.id)+'"><span class="pulse-tile-head">Rezeptidee</span><b class="pulse-tile-value">'+esc(r.title)+'</b><small>'+esc(r.sub.split(' · ')[0])+'</small></button>':''}
function lifeTiles(){
 const order={morning:['next','night','body','training','recipe'],day:['body','training','next','recipe','night'],evening:['next','evening','night','body','training']}[dayPeriod()];
 const build={body:tileBody,training:tileTraining,next:tileNext,night:tileNight,evening:tileEvening,recipe:tileRecipe};
 return '<div class="pulse-bento">'+order.map(k=>build[k]()).join('')+'</div>';
}
function weekStrip(date){
 const monday=PulseLife.offset(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
 return '<div class="life-day-controls">'+lifeButton('‹',lifeCall('lifeMoveDay',-7),'life-iconbtn')+'<div class="life-week">'+Array.from({length:7},(_,i)=>{const d=PulseLife.offset(monday,i);return '<button type="button" class="life-weekday '+(d===date?'selected':'')+'" aria-label="'+esc(lifeDate(d))+'" aria-pressed="'+(d===date)+'" onclick="'+lifeCall('lifeSelectDay',d)+'"><small>'+['Mo','Di','Mi','Do','Fr','Sa','So'][i]+'</small><b>'+Number(d.slice(8))+'</b><i class="'+(PulseLife.day(db,d).length?'filled':'')+'"></i></button>'}).join('')+'</div>'+lifeButton('›',lifeCall('lifeMoveDay',7),'life-iconbtn')+'</div>';
}
function monthPanel(date){
 if(!lifeMonthOpen)return '';
 return '<div class="life-month"><div class="life-row">'+lifeButton('‹',lifeCall('lifeShiftMonth',-1),'life-iconbtn')+'<b>'+esc(lifeDate(date,{month:'long',year:'numeric'}))+'</b>'+lifeButton('›',lifeCall('lifeShiftMonth',1),'life-iconbtn')+'</div><div class="life-monthgrid">'+['M','D','M','D','F','S','S'].map(t=>'<small>'+t+'</small>').join('')+PulseCalendar.monthDays(date.slice(0,7)).map(d=>'<button type="button" aria-label="'+esc(lifeDate(d))+'" aria-pressed="'+(d===date)+'" class="'+(d.slice(0,7)!==date.slice(0,7)?'outside':'')+'" onclick="'+lifeCall('lifeSelectDay',d)+'">'+Number(d.slice(8))+(PulseLife.day(db,d).length?'<i></i>':'')+'</button>').join('')+'</div></div>';
}
function renderLifeToday(){
 const host=document.getElementById('lifeTodayContent');if(!host)return;const date=lifeSelectedDay||key();lifeSelectedDay=date;const isToday=date===key();
 const items=PulseLife.day(db,date),all=PulseLife.list(db);
 const loose=all.filter(x=>x.kind==='task'&&x.status==='open'&&!x.date).slice(0,3),overdue=all.filter(x=>x.kind==='task'&&!['done','parked','archived'].includes(x.status)&&((x.deadline&&x.deadline<key())||(x.date&&x.date<key())));
 const timed=items.filter(x=>x.time),anytime=items.filter(x=>!x.time),focus=lifeState().focus;
 const title=isToday?lifeGreeting():date===PulseLife.offset(key(),1)?'Morgen':lifeDate(date,{weekday:'long'});
 host.innerHTML='<header class="life-pagehead life-greeting"><span class="life-kicker">'+esc(lifeDate(date,{weekday:'long',day:'numeric',month:'long'}))+'</span><h1>'+esc(title)+'</h1></header>'+
  weekStrip(date)+'<div class="life-calendar-tools">'+lifeButton(lifeMonthOpen?'Monat schließen':'Monat',lifeCall('lifeShowMonth'),'life-textbtn')+(isToday?'':lifeButton('Heute',lifeCall('lifeSelectDay',key()),'life-textbtn'))+'</div>'+monthPanel(date)+
  (focus?'<button type="button" class="life-focus-banner" onclick="goView(\'focus\')"><span class="life-live-dot"></span><span><b>'+esc(focus.title)+'</b><small>'+(focus.state==='paused'?'Timer pausiert':'Timer läuft')+'</small></span><span id="lifeMiniClock">'+lifeClock(PulseLife.remaining(focus,Date.now()))+'</span></button>':'')+
  '<div class="life-capture-wrap"><button type="button" class="life-capture-line" onclick="lifeQuick()">'+lifeGlyph('plus')+'<span>'+(lifeState().draft?'Entwurf fortsetzen':'Notiz, Termin, Essen …')+'</span></button>'+(pulseSpeechSupported()?'<button type="button" class="life-capture-mic" aria-label="Per Sprache erfassen" onclick="lifeQuick(true)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg></button>':'')+'</div>'+
  (isToday?lifeTiles()+lifeSystemRows(date)+lifeReviewRows():'')+
  '<div class="life-sectionhead"><h2>Termine</h2>'+lifeButton('＋ Termin',lifeCall('lifeCompose',{kind:'event',date}),'life-textbtn')+'</div>'+
  (timed.length?timed.map(x=>'<div class="life-time-row"><time>'+esc(x.time)+'</time><div class="life-timed-entry '+PulseLife.room(x.room).color+'">'+lifeCard(x,{compact:true})+'<small>'+x.duration+' Min.</small></div></div>').join(''):'<p class="life-none">Keine Termine.</p>')+
  '<div class="life-sectionhead"><h2>Aufgaben</h2>'+lifeButton('＋ Aufgabe',lifeCall('lifeCompose',{kind:'task',date}),'life-textbtn')+'</div>'+
  (anytime.length?anytime.map(x=>lifeCard(x,{compact:true})).join(''):'<p class="life-none">Keine Aufgaben für '+(isToday?'heute':'diesen Tag')+'.</p>')+
  (overdue.length&&isToday?'<button class="life-return-row" type="button" onclick="lifeReview()"><span>!</span><div><b>'+overdue.length+' überfällig</b><small>Neu planen oder parken</small></div><span>›</span></button>':'')+
  (loose.length&&isToday?'<div class="life-sectionhead"><h2>Ohne Datum</h2>'+lifeButton('Alle',lifeCall('lifeOpenLibrary','task'),'life-textbtn')+'</div>'+loose.map(x=>lifeCard(x,{compact:true})).join(''):'');
}
/* One-line capture: type, see where it goes, press Enter. */
const ROOM_TAGS={alltag:'alltag',innen:'innen',innenleben:'innen',sinn:'sinn',rituale:'sinn',tarot:'sinn','körper':'koerper',koerper:'koerper',essen:'koerper',menschen:'menschen',ideen:'ideen',lernen:'ideen',musik:'ideen','draußen':'draussen',draussen:'draussen',natur:'draussen',zuhause:'zuhause',haushalt:'zuhause'};
let quickOverride=null;
function quickAnalyze(raw){
 let room='',text=String(raw||'');
 text=text.replace(/(^|\s)#([\p{L}-]+)/gu,(m,sp,tag)=>{const r=ROOM_TAGS[tag.toLocaleLowerCase('de')];if(r&&!room){room=r;return sp}return m}).replace(/\s+/g,' ').trim();
 const i=interpretCapture(text),when=parseWhen(text),parts=text?parseFoodText(text):[],foodOk=parts.length>0&&parts.every(p=>!p.unknown);
 const amount=/\d|\b(ein|eine|einen|zwei|drei|vier|fünf|halbe?)\b/i.test(text);
 let kind='note';
 if(i.type==='food'||i.type==='drink')kind=foodOk||i.type==='drink'?'meal':'capture';
 else if(['workout','recovery','context','context-clear','historical-review'].includes(i.type))kind='capture';
 else if(when.date)kind=when.time?'event':'task';
 else if(i.type==='task')kind='task';
 else if(foodOk&&amount)kind='meal';
 if(quickOverride&&!(quickOverride==='meal'&&!(foodOk||i.type==='drink'))&&!(quickOverride==='event'&&!when.date))kind=quickOverride;
 return {text,room:room||(kind==='meal'?'koerper':'alltag'),kind,when,type:i.type,foodOk,kcal:Math.round(parts.reduce((a,p)=>a+(p.nut?.kcal||0),0))};
}
function quickDescribe(q){
 const names={note:'Notiz',task:'Aufgabe',event:'Termin',meal:'Mahlzeit'};
 if(q.kind==='capture')return {workout:'Trainingssatz zum Prüfen',recovery:'Erholungstag für heute',context:'Befinden für heute','context-clear':'Befinden: wieder normal','historical-review':'Notiz mit vergangenem Datum',food:'Essen · Menge wird abgefragt',drink:'Getränk'}[q.type]||'Eintrag';
 const when=q.when.date&&(q.kind==='task'||q.kind==='event')?' · '+lifeDate(q.when.date,{weekday:'short',day:'numeric',month:'short'})+(q.when.time&&q.kind==='event'?' '+q.when.time:''):'';
 return names[q.kind]+(q.kind==='meal'&&q.kcal?' · '+q.kcal+' kcal':'')+when+(q.kind==='meal'?'':' · '+PulseLife.room(q.room).name);
}
function quickPreview(){
 const box=document.getElementById('quickRoute'),field=document.getElementById('quickText');if(!box||!field)return;
 if(!field.value.trim()){box.innerHTML='<span class="quick-hint">Datum, Uhrzeit, Mengen und #raum werden erkannt.</span>';return}
 const q=quickAnalyze(field.value),alts=[['note','Notiz'],['task','Aufgabe']];if(q.when.date)alts.push(['event','Termin']);if(q.foodOk)alts.push(['meal','Mahlzeit']);
 box.innerHTML='<span class="quick-target">Wird: <b>'+esc(quickDescribe(q))+'</b></span>'+(q.kind==='capture'?'':'<span class="quick-alts" role="group" aria-label="Stattdessen speichern als">'+alts.map(([k,l])=>'<button type="button" aria-pressed="'+(q.kind===k)+'" onclick="'+lifeCall('quickSet',k)+'">'+l+'</button>').join('')+'</span>');
}
function quickSet(kind){quickOverride=kind;quickPreview();document.getElementById('quickText')?.focus()}
function lifeQuick(voice=false){
 if(lifeState().draft){lifeCompose();return}
 quickOverride=null;
 libDetailShell('<h2 id="lifeDetailHeading" class="srOnly">Erfassen</h2><label class="srOnly" for="quickText">Eintrag</label><textarea id="quickText" class="quick-input" rows="2" enterkeyhint="done" placeholder="z. B. Zahnarzt Freitag 15 Uhr · 2 Bananen · Idee #ideen" oninput="quickOverride=null;quickPreview()" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();quickSave()}"></textarea>'+
  '<div id="quickRoute" class="quick-route" aria-live="polite"></div><div class="quick-actions">'+(pulseSpeechSupported()?'<button type="button" class="life-mic" data-target="quickText" aria-pressed="false" onclick="pulseDictate(\'quickText\',this)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg><span>Sprechen</span></button>':'')+lifeButton('Mehr Details','quickMore()','life-textbtn')+'<button type="button" class="life-btn dark" onclick="quickSave()">Speichern</button></div>');
 const f=document.getElementById('quickText');setTimeout(()=>{f?.focus();quickPreview();if(voice)pulseDictate('quickText')},60);
}
function quickSave(){
 const field=document.getElementById('quickText');if(!field)return;const q=quickAnalyze(field.value);if(!q.text)return toast('Bitte etwas eingeben.');
 pulseStopDictation();
 if(q.kind==='meal'){const m=directIntakeCapture(q.text);if(!m){quickOverride='capture';return quickSave()}save();lifeCloseSheet();render();pulseTap();return toast(intakeMessage(m),'Rückgängig')}
 if(q.kind==='capture'){lifeCloseSheet();const r=universalCapture(q.text);if(r.type==='food-review'){const token=pendingFoodCapture;setTimeout(()=>{openCapture();pendingFoodCapture=token;showFoodFollowup(q.text)},320);return}render();pulseTap();return toast(r.message,['food','drink'].includes(r.type)?'Rückgängig':'')}
 const lines=q.text.split('\n'),fields={kind:q.kind,room:q.room,title:lines[0].slice(0,180),body:lines.slice(1).join('\n').trim()};
 if(q.kind!=='note'&&q.when.date){fields.date=q.when.date;if(q.kind==='event')fields.time=q.when.time||''}
 if(q.kind==='event'&&!fields.date)fields.date=key();
 const id=uid('life');if(lifeMutate(()=>PulseLife.create(db,fields,id,new Date().toISOString()),quickDescribe(q).split(' · ')[0]+' gespeichert')){lifeCloseSheet();pulseTap()}
}
function quickMore(){
 const field=document.getElementById('quickText');const q=quickAnalyze(field?.value||'');pulseStopDictation();
 const lines=q.text.split('\n');lifeCompose({kind:['note','task','event'].includes(q.kind)?q.kind:'note',room:q.room,title:lines[0]||'',body:lines.slice(1).join('\n'),date:q.when.date||'',time:q.kind==='event'?q.when.time||'':''});
}
