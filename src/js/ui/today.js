// SOURCE: ui/today.js
/* Tag: the one-line capture, the day's appointments and tasks first, then the body, then a short list for the rest. */
/* Haptics only after the person has touched the page (Chrome blocks it otherwise). */
function pulseTap(ms=12){try{if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;navigator.vibrate?.(ms)}catch(_){}}
let lifeJustDone=null,lifeJustDoneAt=0;
function dayPeriod(h=new Date().getHours()){return h>=5&&h<11?'morning':h>=11&&h<18?'day':'evening'}
function ring(value,goal,label,unit){
 const p=goal?Math.max(0,Math.min(1,value/goal)):0,C=2*Math.PI*17,de=n=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:unit==='L'?2:1});
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
 return '<button type="button" class="pulse-tile tile-training" onclick="openTodaysTraining()"><span class="pulse-tile-head">Training</span><b class="pulse-tile-value">'+esc(status)+'</b><span class="pulse-dots" aria-label="'+anz(n,'Trainingstag','Trainingstage')+' in den letzten 7 Tagen">'+days.map(x=>'<i class="'+(trainedOn(x)?'on':'')+(x===key()?' today':'')+'" title="'+esc(lifeDate(x,{weekday:'short'}))+'"></i>').join('')+'</span><small>'+n+' von 7 Tagen</small></button>';
}
/* Start page, lower half: what belongs to the body, then one quiet list for everything else. */
function toolIcon(id){const t=MORE_TOOLS.find(x=>x[0]===id);return '<svg viewBox="0 0 24 24" aria-hidden="true">'+(t?t[4]:'')+'</svg>'}
function tileWater(){
 const w=Number(db.waterGoal)||2,v=Math.round((today().water||0)*100)/100,de=n=>n.toLocaleString('de-DE',{maximumFractionDigits:2});
 return '<button type="button" class="pulse-tile tile-water" onclick="addWater(.25)" aria-label="250 Milliliter Wasser eintragen. Heute '+de(v)+' von '+de(w)+' Litern"><span class="pulse-tile-head">Wasser</span><b class="pulse-tile-value">＋ 250 ml</b><small>'+de(v)+' von '+de(w)+' L</small></button>';
}
function lifeBodyBlock(){
 return '<div class="life-sectionhead"><h2>Körper</h2>'+lifeButton('Öffnen','goView(\'bodyhub\')','life-textbtn')+'</div><div class="pulse-bento">'+tileBody()+tileTraining()+tileWater()+'</div>';
}
function alsoRow(icon,title,sub,call,cls=''){return '<button type="button" class="today-also-row '+cls+'" onclick="'+call+'"><span class="today-also-ic" aria-hidden="true">'+icon+'</span><span class="today-also-text"><b>'+esc(title)+'</b><small>'+esc(sub)+'</small></span><i aria-hidden="true">›</i></button>'}
/* Start page extras. Everything stays in the app under "Mehr"; here she picks what also shows on the
   start page. Nothing is on until she turns it on, so the page stays appointments, tasks, body. */
const HOME_EXTRAS=[['abschluss','Tagesabschluss','Abends: drei Sätze zum Tag'],['mond','Mond','Phase und nächster Vollmond'],['tarot','Tageskarte','Ziehen oder ansehen'],['sky','Dein Himmel','Wie viele Sterne leuchten']];
function homeExtras(){return Array.isArray(db.uiPrefs.home)?db.uiPrefs.home:[]}
function homeToggle(id){const h=homeExtras().filter(x=>HOME_EXTRAS.some(e=>e[0]===x)),i=h.indexOf(id);if(i<0)h.push(id);else h.splice(i,1);db.uiPrefs.home=h;save();homeSettings()}
function homeSettings(){
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail'),on=homeExtras();el.hidden=false;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Startseite</h2><p class="life-detail-intro">Termine, Aufgaben und Körper stehen immer da. Was soll zusätzlich auf der Startseite stehen? Alles bleibt unter „Mehr“ erreichbar.</p>'+HOME_EXTRAS.map(([id,t,sub])=>'<div class="life-settings-row"><div><b>'+esc(t)+'</b><p>'+esc(sub)+'</p></div><button type="button" class="life-btn home-switch" role="switch" aria-checked="'+on.includes(id)+'" aria-label="'+esc(t)+' auf der Startseite" onclick="'+lifeCall('homeToggle',id)+'">'+(on.includes(id)?'An':'Aus')+'</button></div>').join('');
 openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
}
function lifeAlsoBlock(){
 const on=homeExtras(),rows=[];if(!on.length)return '';
 const m=cosmosMoon(key()),card=libTodayCard(),lit=skyData().filter(b=>b.done).length;
 if(on.includes('abschluss')&&dayPeriod()==='evening')rows.push(alsoRow(lifeGlyph('check'),'Tagesabschluss','Drei Sätze zum Tag',lifeCall('lifeOpenLib','sinn-tagesabschluss')));
 if(on.includes('mond'))rows.push(alsoRow(moonSvg(m,24),'Mond',m.name+', '+moonLine(m),lifeCall('lifeOpenCalendar',key())));
 if(on.includes('tarot'))rows.push(card?alsoRow(toolIcon('tarot'),'Tageskarte',card.card.name,lifeCall('lifeTarotOpen',card.index)):alsoRow(toolIcon('tarot'),'Tageskarte','Noch keine gezogen',lifeCall('lifeDrawCard')));
 if(on.includes('sky'))rows.push(alsoRow(toolIcon('sky'),'Dein Himmel',anz(lit,'Stern leuchtet','Sterne leuchten'),'lifeOpenSky()'));
 return rows.length?'<div class="life-sectionhead"><h2>Außerdem</h2>'+lifeButton('Anpassen','homeSettings()','life-textbtn')+'</div><div class="today-also">'+rows.join('')+'</div>':'';
}
function weekStrip(date){
 const monday=PulseLife.offset(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
 return '<div class="life-day-controls">'+lifeButton('‹',lifeCall('lifeMoveDay',-7),'life-iconbtn')+'<div class="life-week">'+Array.from({length:7},(_,i)=>{const d=PulseLife.offset(monday,i);return '<button type="button" class="life-weekday '+(d===date?'selected':'')+'" aria-label="'+esc(lifeDate(d))+'" aria-pressed="'+(d===date)+'" onclick="'+lifeCall('lifeSelectDay',d)+'"><small>'+['Mo','Di','Mi','Do','Fr','Sa','So'][i]+'</small><b>'+Number(d.slice(8))+'</b><i class="'+(PulseLife.day(db,d).length?'filled':'')+'"></i></button>'}).join('')+'</div>'+lifeButton('›',lifeCall('lifeMoveDay',7),'life-iconbtn')+'</div>';
}
/* The day line: 24 hours as one line. Daylight is the lighter stretch, appointments stand on it as
   bars, the dot is now. Above it: what comes next and how long until then. */
function dayMinutes(t){const [h,m]=String(t||'').split(':').map(Number);return (h||0)*60+(m||0)}
function spanText(min){return min<60?min+' Min.':Math.floor(min/60)+' Std.'+(min%60?' '+(min%60)+' Min.':'')}
function nextUp(timed,nowMin){
 const end=x=>dayMinutes(x.time)+(Number(x.duration)||60),run=timed.find(x=>dayMinutes(x.time)<=nowMin&&nowMin<end(x));
 if(run)return {x:run,text:'läuft noch <b>'+spanText(end(run)-nowMin)+'</b>'};
 const next=timed.find(x=>dayMinutes(x.time)>nowMin);
 return next?{x:next,text:'beginnt in <b>'+spanText(dayMinutes(next.time)-nowMin)+'</b>, um '+esc(next.time)+' Uhr'}:null;
}
function dayLine(date,timed,nowMin,glide){
 const pct=m=>(Math.max(0,Math.min(1440,m))/14.4).toFixed(2),ofDay=ms=>{const d=new Date(ms);return d.getHours()*60+d.getMinutes()};
 let sun=null;try{sun=PulseAstro.sunTimes(date)}catch(_){}
 const rise=sun?ofDay(sun.rise):0,set=sun?ofDay(sun.set):0;
 return '<div class="dayline" role="img" aria-label="Tagesverlauf von 0 bis 24 Uhr'+(sun?', hell von '+cosmosTime(sun.rise)+' bis '+cosmosTime(sun.set)+' Uhr':'')+', '+anz(timed.length,'Termin','Termine')+'">'+
  (sun&&set>rise?'<i class="dayline-sun" style="left:'+pct(rise)+'%;width:'+pct(set-rise)+'%"></i>':'')+
  timed.map(x=>{const a=dayMinutes(x.time),d=Number(x.duration)||60;return '<i class="dayline-ev '+PulseLife.room(x.room).color+(a+d<=nowMin?' past':'')+'" style="left:'+pct(a)+'%;width:'+pct(Math.min(d,1440-a))+'%"></i>'}).join('')+
  '<i class="dayline-now'+(glide?' glide':'')+'" style="left:'+pct(nowMin)+'%"></i><span class="dayline-hours" aria-hidden="true"><b>6</b><b>12</b><b>18</b></span></div>';
}
let todayHeroShown=false;
/* The start page opens with the sky as it is right now: daylight, dusk or night, the sun where it stands
   on its way across, the moon at night. On it: what comes next, and the day line. */
function skyState(date,now){
 let sun=null;try{sun=PulseAstro.sunTimes(date)}catch(_){}
 if(!sun||!(sun.set>sun.rise))return {phase:'day',sun:null,p:.5};
 const t=now.getTime(),near=45*6e4,p=(t-sun.rise)/(sun.set-sun.rise);
 return {sun,p,phase:Math.abs(t-sun.rise)<near?'dawn':Math.abs(t-sun.set)<near?'dusk':p>0&&p<1?'day':'night'};
}
function skyLine(sky,now,open){
 const tasks=open?anz(open,'Aufgabe','Aufgaben')+' offen. ':'';
 if(!sky.sun)return tasks||'Heute steht kein Termin an.';
 const t=now.getTime();
 if(sky.phase==='dawn')return tasks+'Die Sonne geht gerade auf.';
 if(sky.phase==='dusk')return tasks+'Die Sonne geht gerade unter.';
 if(sky.phase==='day')return tasks+'Noch '+spanText(Math.max(1,Math.round((sky.sun.set-t)/6e4)))+' Tageslicht.';
 if(t<sky.sun.rise)return tasks+'Sonnenaufgang um '+cosmosTime(sky.sun.rise)+' Uhr.';
 let next=null;try{next=PulseAstro.sunTimes(PulseLife.offset(key(),1))}catch(_){}
 return tasks+(next?'Sonnenaufgang morgen um '+cosmosTime(next.rise)+' Uhr.':'Die Sonne ist untergegangen.');
}
function todayHero(){
 const date=key(),now=new Date(),nowMin=now.getHours()*60+now.getMinutes(),sky=skyState(date,now);
 const items=PulseLife.day(db,date),timed=items.filter(x=>x.time&&x.kind==='event').sort((a,b)=>dayMinutes(a.time)-dayMinutes(b.time)),up=nextUp(timed,nowMin);
 const open=items.filter(x=>x.kind==='task'&&x.status==='open').length;
 const glide=!todayHeroShown;todayHeroShown=true;
 const p=Math.max(0,Math.min(1,sky.p)),orb=sky.phase==='night'?'<span class="sky-moon" aria-hidden="true">'+moonSvg(cosmosMoon(date),46)+'</span>':'<i class="sky-sun" aria-hidden="true" style="left:'+(8+p*84).toFixed(1)+'%;top:'+(78+(1-Math.sin(Math.PI*p))*58).toFixed(0)+'px"></i>';
 return '<header class="life-pagehead sky-card sky-'+sky.phase+'" id="todayHero">'+orb+'<span class="sky-date">'+esc(lifeDate(date,{weekday:'long',day:'numeric',month:'long'}))+'</span>'+
  (up?'<h1><button type="button" onclick="'+lifeCall('lifeOpenItem',up.x.id)+'">'+esc(up.x.title)+'</button></h1><p class="sky-when">'+up.text+'</p>'
     :'<h1>'+esc(lifeGreeting())+'</h1><p class="sky-when">'+esc(skyLine(sky,now,open))+'</p>')+
  dayLine(date,timed,nowMin,glide)+
  (sky.sun?'<p class="sky-foot"><span>Sonne '+cosmosTime(sky.sun.rise)+' bis '+cosmosTime(sky.sun.set)+'</span><span>'+esc(cosmosMoon(date).name)+'</span></p>':'')+'</header>';
}
/* Today's card from the Stapel, with its picture. */
function todayDeck(){
 let d,card;try{if(stapelPrepare())setTimeout(save,0);d=PulseDeck.ensure(db);card=d.cards[Math.min(d.pos,d.cards.length-1)]}catch(_){return ''}
 if(!card)return '';
 const tmp=document.createElement('div');tmp.innerHTML=stapelCardHTML(card);const art=tmp.querySelector('.stapel-card'),cover=tmp.querySelector('.stapel-cover');if(!art||!cover)return '';
 cover.querySelectorAll('button,a,iframe').forEach(e=>e.remove());cover.querySelectorAll('[id],[tabindex]').forEach(e=>{e.removeAttribute('id');e.removeAttribute('tabindex')});
 const title=(cover.querySelector('h2')||{}).textContent||'Karte des Tages';
 return '<div class="life-sectionhead"><h2>Stapel</h2><span class="life-subtle">'+esc(stapelStatus())+'</span></div><button type="button" class="deck-preview tile-stapel '+esc(art.className)+'" onclick="lifeOpenStapel()" aria-label="Stapel öffnen: '+esc(title)+'">'+cover.outerHTML.replace(/<h2/g,'<strong class="deck-title"').replace(/<\/h2>/g,'</strong>')+'</button>';
}
/* Keep the dot and the countdown current without redrawing the page. */
setInterval(()=>{const el=document.getElementById('todayHero');if(el&&!document.hidden&&lifeSelectedDay===key())el.outerHTML=todayHero()},30000);
function renderLifeToday(){
 const host=document.getElementById('lifeTodayContent');if(!host)return;const date=lifeSelectedDay||key();lifeSelectedDay=date;const isToday=date===key();
 const items=PulseLife.day(db,date),all=PulseLife.list(db);
 const loose=all.filter(x=>x.kind==='task'&&x.status==='open'&&!x.date).slice(0,3),overdue=all.filter(x=>x.kind==='task'&&!['done','parked','archived'].includes(x.status)&&((x.deadline&&x.deadline<key())||(x.date&&x.date<key())));
 const timed=items.filter(x=>x.time),allDay=items.filter(x=>!x.time&&x.kind==='event'),anytime=items.filter(x=>!x.time&&x.kind!=='event'),focus=lifeState().focus;
 const title=date===PulseLife.offset(key(),1)?'Morgen':lifeDate(date,{weekday:'long'});
 const nowMin=new Date().getHours()*60+new Date().getMinutes();
 host.innerHTML=(isToday?todayHero():'<header class="life-pagehead life-greeting"><div><span class="life-kicker">'+esc(lifeDate(date,{weekday:'long',day:'numeric',month:'long'}))+'</span><h1>'+esc(title)+'</h1></div></header>')+
  (isToday?yesterdayLine():'')+weekStrip(date)+(isToday?'':'<div class="life-calendar-tools">'+lifeButton('Zurück zu heute',lifeCall('lifeSelectDay',key()),'life-textbtn')+'</div>')+
  (focus?'<button type="button" class="life-focus-banner" onclick="goView(\'focus\')"><span class="life-live-dot"></span><span><b>'+esc(focus.title)+'</b><small>'+(focus.state==='paused'?'Timer pausiert':'Timer läuft')+'</small></span><span id="lifeMiniClock">'+lifeClock(PulseLife.remaining(focus,Date.now()))+'</span></button>':'')+
  (isToday?lifeReviewRows():'')+
  '<section class="day-card"><div class="day-card-head"><h2>'+(isToday?'Heute':esc(title))+'</h2><span class="day-add">'+lifeButton('＋ Termin',lifeCall('lifeCompose',{kind:'event',date}),'')+lifeButton('＋ Aufgabe',lifeCall('lifeCompose',{kind:'task',date}),'')+'</span></div>'+
  (allDay.length?'<div class="life-allday"><span class="life-subtle">Ganztägig</span>'+allDay.map(x=>lifeCard(x,{compact:true})).join('')+'</div>':'')+
  timed.map(x=>'<div class="life-time-row'+(isToday&&dayMinutes(x.time)+(Number(x.duration)||60)<=nowMin?' past':isToday&&dayMinutes(x.time)<=nowMin?' now':'')+'"><time>'+esc(x.time)+'</time><div class="life-timed-entry '+PulseLife.room(x.room).color+'">'+lifeCard(x,{compact:true})+'<small>'+x.duration+' Min.</small></div></div>').join('')+
  anytime.map(x=>lifeCard(x,{compact:true})).join('')+
  (allDay.length||timed.length||anytime.length?'':'<div class="day-empty"><span aria-hidden="true">'+lifeGlyph('sun')+'</span><p><b>Nichts geplant.</b> Schreib unten einfach los, zum Beispiel „Zahnarzt morgen 15 Uhr“.</p></div>')+'</section>'+
  (overdue.length&&isToday?'<button class="life-return-row" type="button" onclick="lifeReview()"><span>!</span><div><b>'+overdue.length+' überfällig</b><small>Neu planen oder parken</small></div><span>›</span></button>':'')+
  (loose.length&&isToday?'<div class="life-sectionhead"><h2>Ohne Datum</h2>'+lifeButton('Alle',lifeCall('lifeOpenLibrary','task'),'life-textbtn')+'</div>'+loose.map(x=>lifeCard(x,{compact:true})).join(''):'')+
  (isToday?lifeBodyBlock()+todayDeck()+lifeAlsoBlock()+lifeSystemRows(date):'');
 /* The capture line lives in the dock under every main screen; keep its hint and microphone current. */
 const hint=document.getElementById('lifeComposerHint'),mic=document.getElementById('lifeComposerMic');
 if(hint)hint.textContent=lifeState().draft?'Entwurf fortsetzen':'Notiz, Termin, Essen …';if(mic)mic.hidden=!pulseSpeechSupported();
 if(lifeDaySlide){host.classList.remove('slide-next','slide-prev');void host.offsetWidth;host.classList.add('slide-'+lifeDaySlide);lifeDaySlide=''}
}
/* One-line capture: type, see where it goes, press Enter. */
const ROOM_TAGS={alltag:'alltag',innen:'innen',innenleben:'innen',sinn:'sinn',rituale:'sinn',tarot:'sinn','körper':'koerper',koerper:'koerper',essen:'koerper',menschen:'menschen',ideen:'ideen',lernen:'ideen',musik:'ideen','draußen':'draussen',draussen:'draussen',natur:'draussen',zuhause:'zuhause',haushalt:'zuhause'};
let quickOverride=null;
function quickAnalyze(raw){
 let room='',text=String(raw||'');
 text=text.replace(/(^|\s)#([\p{L}-]+)/gu,(m,sp,tag)=>{const r=ROOM_TAGS[tag.toLocaleLowerCase('de')];if(r&&!room){room=r;return sp}return m}).replace(/\s+/g,' ').trim();
 /* A series ("jeden Dienstag", "alle 2 Wochen" …) is read first; date and time then come from the rest. */
 const rep=PulseCapture.repeat(text),i=interpretCapture(text),when=parseWhen(rep?rep.rest:text),parts=text?parseFoodText(text):[],foodOk=parts.length>0&&parts.every(p=>!p.unknown);
 if(rep&&rep.rule.pm&&when.time){const pm=v=>{const h=Number(v.slice(0,2));return h>=1&&h<12?String(h+12)+v.slice(2):v};when.time=pm(when.time);if(when.end)when.end=pm(when.end)}
 const series=rep?PulseRecur.place(rep.rule,when.date||key()):null;
 const amount=/\d|\b(ein|eine|einen|zwei|drei|vier|fünf|halbe?)\b/i.test(text);
 let kind='note';const link=(text.match(/https?:\/\/\S+/)||[''])[0];
 // How someone feels ("jeden Tag Kopfschmerzen") stays a body note; plans with a rhythm become appointments.
 if(['recovery','context','context-clear','historical-review'].includes(i.type))kind='capture';
 else if(series)kind='event';
 else if(i.type==='food'||i.type==='drink')kind=foodOk||i.type==='drink'?'meal':'capture';
 else if(i.type==='workout')kind='capture';
 else if(when.date)kind=when.time?'event':'task';
 else if(i.type==='task')kind='task';
 else if(foodOk&&amount)kind='meal';
 if(link&&(kind==='meal'||kind==='capture'))kind='note';
 const video=link&&PulseVideo.parseAny(link.replace(/[).,;!?]+$/,''));if(video&&!room)room=PulseVideo.room(text.replace(link,''),video);if(video&&!when.date&&!series)kind='video';
 if(quickOverride&&!(quickOverride==='video'&&!video)&&!(quickOverride==='meal'&&!(foodOk||i.type==='drink'))&&!(quickOverride==='event'&&!when.date&&!series))kind=quickOverride;
 return {text,link,video:video?video.type:'',room:room||(kind==='meal'?'koerper':'alltag'),kind,when,rep,series:series&&(kind==='event'||kind==='task')?series:null,remind:PulseCapture.remind(text),type:i.type,foodOk,kcal:Math.round(parts.reduce((a,p)=>a+(p.nut?.kcal||0),0))};
}
/* A series as a task: the task comes back after it is done (1, 7, 14 or 30 days), when the rule allows it. */
function quickTaskRepeat(r){if(!r)return 0;if(r.freq==='daily'&&r.interval===1)return 1;if(r.freq==='weekly'&&(r.byday||[]).length===1&&r.interval<=2)return 7*r.interval;if(r.freq==='monthly'&&r.interval===1)return 30;return 0}
function quickSpan(q){return q.when.time?q.when.time+(q.when.end?'–'+q.when.end:'')+' Uhr':'ganztägig'}
function quickDescribe(q){
 const names={note:'Notiz',task:'Aufgabe',event:'Termin',meal:'Mahlzeit'},roomName=' · '+PulseLife.room(q.room).name,timed=!!q.when.time,remind=q.kind==='event'&&q.remind!=null?' · Erinnerung '+calRemindLabel(q.remind==='default'?(timed?15:-480):q.remind).replace(/^Am Tag/,'am Tag'):'';
 if(q.kind==='video')return (q.video==='playlist'?'Playlist':'Video')+' für den Videos-Tab'+(q.room&&q.room!=='alltag'?' · '+PulseLife.room(q.room).name:'');
 if(q.kind==='capture')return {workout:'Trainingssatz zum Prüfen',recovery:'Erholungstag für heute',context:'Befinden für heute','context-clear':'Befinden: wieder normal','historical-review':'Notiz mit vergangenem Datum',food:'Essen · Menge wird abgefragt',drink:'Getränk'}[q.type]||'Eintrag';
 const from=d=>lifeDate(d,{weekday:'short',day:'numeric',month:'short',...(d.slice(0,4)!==key().slice(0,4)?{year:'numeric'}:{})});
 if(q.series&&q.kind==='event'){let rule='';try{const x={date:q.series.date,recur:q.series.recur};rule=PulseRecur.describe({date:x.date,recur:PulseRecur.normalize(x).recur})}catch(_){rule='Wiederholung'}return 'Terminserie · '+rule+' · '+quickSpan(q)+' · ab '+from(q.series.date)+remind+roomName}
 if(q.series&&q.kind==='task'){const n=quickTaskRepeat(q.series.recur);return 'Aufgabe · '+from(q.series.date)+' · '+(n?'nach Erledigung alle '+n+(n===1?' Tag':' Tage'):'ohne Wiederholung')+roomName}
 const when=q.when.date&&(q.kind==='task'||q.kind==='event')?' · '+from(q.when.date)+(q.when.time&&q.kind==='event'?' '+q.when.time+(q.when.end?'–'+q.when.end:''):''):'';
 return names[q.kind]+(q.kind==='meal'&&q.kcal?' · '+q.kcal+' kcal':'')+when+remind+(q.kind==='meal'?'':roomName);
}
function quickPreview(){
 const box=document.getElementById('quickRoute'),field=document.getElementById('quickText');if(!box||!field)return;
 if(!field.value.trim()){box.innerHTML='<span class="quick-hint">Erkennt Datum, Uhrzeit, Wiederholungen wie „jeden Dienstag“, Mengen und #raum.</span>';return}
 const q=quickAnalyze(field.value),alts=[['note','Notiz'],['task','Aufgabe']];if(q.video)alts.unshift(['video',q.video==='playlist'?'Playlist':'Video']);if(q.when.date||q.rep)alts.push(['event','Termin']);if(q.foodOk)alts.push(['meal','Mahlzeit']);
 box.innerHTML='<span class="quick-target">Wird: <b>'+esc(quickDescribe(q))+'</b></span>'+(q.kind==='capture'?'':'<span class="quick-alts" role="group" aria-label="Stattdessen speichern als">'+alts.map(([k,l])=>'<button type="button" aria-pressed="'+(q.kind===k)+'" onclick="'+lifeCall('quickSet',k)+'">'+l+'</button>').join('')+'</span>');
}
function quickSet(kind){quickOverride=kind;quickPreview();document.getElementById('quickText')?.focus()}
function lifeQuick(voice=false){
 if(lifeState().draft){lifeCompose();return}
 quickOverride=null;
 libDetailShell('<h2 id="lifeDetailHeading" class="srOnly">Erfassen</h2><label class="srOnly" for="quickText">Eintrag</label><textarea id="quickText" class="quick-input" rows="2" enterkeyhint="done" placeholder="z. B. Probe jeden Dienstag 19 Uhr · 2 Bananen · Idee #ideen" oninput="quickOverride=null;quickPreview()" onkeydown="if(event.key===\'Enter\'&&!event.shiftKey){event.preventDefault();quickSave()}"></textarea>'+
  '<div id="quickRoute" class="quick-route" aria-live="polite"></div><div class="quick-actions">'+(pulseSpeechSupported()?'<button type="button" class="life-mic" data-target="quickText" aria-pressed="false" onclick="pulseDictate(\'quickText\',this)"><svg viewBox="0 0 24 24" aria-hidden="true"><rect x="9" y="3" width="6" height="11" rx="3"/><path d="M5 11a7 7 0 0 0 14 0M12 18v3"/></svg><span>Sprechen</span></button>':'')+lifeButton('Mehr Details','quickMore()','life-textbtn')+'<button type="button" class="life-btn dark" onclick="quickSave()">Speichern</button></div>');
 const f=document.getElementById('quickText');setTimeout(()=>{f?.focus();quickPreview();if(voice)pulseDictate('quickText')},60);
}
/* Fields for a note, task or appointment: the title loses the date and time words, a series becomes a
   repeating appointment (or a task that comes back after it is done). */
function quickFields(q){
 const base=q.rep&&q.kind!=='note'?q.rep.rest:q.text,rest=q.link?base.replace(q.link,'').trim():base,lines=rest.split('\n');
 let title=(lines[0]||(PulseVideo.parseAny(q.link)?'YouTube-Video':'Link')).slice(0,180);
 if((q.kind==='event'||q.kind==='task')&&(q.when.date||q.series))title=PulseCapture.strip(title)||title;
 const fields={kind:q.kind,room:q.room,title,body:lines.slice(1).join('\n').trim()};
 if(q.link)fields.url=q.link.replace(/[).,;!?]+$/,'');
 if(q.series&&q.kind==='event'){fields.date=q.series.date;fields.time=q.when.time||'';fields.recur=q.series.recur}
 else if(q.series&&q.kind==='task'){fields.date=q.series.date;fields.repeat=quickTaskRepeat(q.series.recur)}
 else if(q.kind!=='note'&&q.when.date){fields.date=q.when.date;if(q.kind==='event')fields.time=q.when.time||''}
 if(q.kind==='event'){
  if(!fields.date)fields.date=key();
  if(fields.time&&q.when.end){let min=(Date.parse('2000-01-01T'+q.when.end+':00Z')-Date.parse('2000-01-01T'+fields.time+':00Z'))/60000;if(min<=0)min+=1440;fields.duration=min}
  if(q.remind!=null)fields.remind=q.remind==='default'?(fields.time?15:-480):q.remind;
 }
 return fields;
}
function quickSave(){
 const field=document.getElementById('quickText');if(!field)return;const q=quickAnalyze(field.value);if(!q.text)return toast('Bitte etwas eingeben.');
 pulseStopDictation();
 if(q.kind==='meal'){const m=directIntakeCapture(q.text);if(!m){quickOverride='capture';return quickSave()}save();lifeCloseSheet();render();pulseTap();return toast(intakeMessage(m),'Rückgängig')}
 if(q.kind==='capture'){lifeCloseSheet();const r=universalCapture(q.text);if(r.type==='food-review'){const token=pendingFoodCapture;setTimeout(()=>{openCapture();pendingFoodCapture=token;showFoodFollowup(q.text)},320);return}render();pulseTap();return toast(r.message,['food','drink'].includes(r.type)?'Rückgängig':'')}
 if(q.kind==='video'){const t=q.text.replace(q.link,'').trim(),x=vaultAdd(q.link.replace(/[).,;!?]+$/,''),{title:t,room:q.room==='alltag'&&!/#alltag/i.test(field.value)?'':q.room});if(x)lifeCloseSheet();return}
 const fields=quickFields(q),id=uid('life');
 if(lifeMutate(()=>PulseLife.create(db,fields,id,new Date().toISOString()),quickDescribe(q).split(' · ')[0]+' gespeichert')){lifeCloseSheet();pulseTap()}
}
/* "Mehr Details": appointments open the calendar editor with everything filled in, the rest the entry editor. */
function quickMore(){
 const field=document.getElementById('quickText');const q=quickAnalyze(field?.value||'');pulseStopDictation();
 if(q.kind==='event'){const f=quickFields(q);return calEdit('',f.date,f)}
 if(q.kind==='note'||q.kind==='task'){const f=quickFields(q);return lifeCompose({kind:q.kind,room:f.room,title:f.title,body:f.body,date:f.date||(q.kind==='note'?q.when.date:'')||'',time:'',url:f.url||'',repeat:f.repeat||0})}
 const lines=q.text.split('\n');lifeCompose({kind:'note',room:q.room,title:lines[0]||'',body:lines.slice(1).join('\n'),date:'',time:''});
}

/* Swipe left or right on the day to move one day on or back. */
var lifeDaySlide='';
(function(){
 let x0=0,y0=0,t0=0;
 document.addEventListener('touchstart',e=>{const h=document.getElementById('lifeTodayContent');x0=0;if(!h||!h.contains(e.target)||e.touches.length!==1||e.target.closest('input,textarea,select'))return;x0=e.touches[0].clientX;y0=e.touches[0].clientY;t0=Date.now()},{passive:true});
 document.addEventListener('touchend',e=>{if(!x0)return;const dx=e.changedTouches[0].clientX-x0,dy=e.changedTouches[0].clientY-y0;x0=0;if(Math.abs(dx)<70||Math.abs(dx)<Math.abs(dy)*2||Date.now()-t0>700)return;lifeDaySlide=dx<0?'next':'prev';lifeMoveDay(dx<0?1:-1)},{passive:true});
})();
