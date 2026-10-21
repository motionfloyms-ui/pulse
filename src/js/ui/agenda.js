// SOURCE: ui/agenda.js
/* Appointments: detail, editor (all-day, multi-day, repeats, reminders), .ics import and export,
   and reminders while Pulse is open. */
const CAL_TZ=(()=>{try{return Intl.DateTimeFormat().resolvedOptions().timeZone||'Europe/Berlin'}catch(_){return 'Europe/Berlin'}})();
const CAL_REMIND_TIMED=[['','Keine'],['0','Zur Startzeit'],['5','5 Minuten vorher'],['10','10 Minuten vorher'],['15','15 Minuten vorher'],['30','30 Minuten vorher'],['60','1 Stunde vorher'],['120','2 Stunden vorher'],['1440','1 Tag vorher']];
const CAL_REMIND_ALLDAY=[['','Keine'],['-480','Am Tag um 8 Uhr'],['360','Am Vortag um 18 Uhr'],['1440','1 Tag vorher, 0 Uhr']];
let calEditRecurDays=null;
function calSheet(html,focus){document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;el.innerHTML=html;if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),focus||'#lifeDetailHeading');else document.querySelector(focus||'#lifeDetailHeading')?.focus()}
function calRemindText(x){if(x.remind==null)return '';const list=x.time?CAL_REMIND_TIMED:CAL_REMIND_ALLDAY,hit=list.find(([v])=>v!==''&&Number(v)===x.remind);return hit?hit[1]:x.remind+' Minuten vorher'}
/* ---------- Detail ---------- */
function calOpen(id,date){
 const x=PulseLife.get(db,id);if(!x)return;if(x.kind!=='event')return lifeOpenItem(id,true);
 const occ=PulseRecur.occurrence(x,date)||{start:x.date,day:1,days:1},r=PulseLife.room(x.room),start=occ.start;
 const dateLine=occ.days>1?lifeDate(start,{weekday:'short',day:'numeric',month:'long'})+' – '+lifeDate(PulseLife.offset(start,occ.days-1),{weekday:'short',day:'numeric',month:'long'}):lifeDate(start,{weekday:'long',day:'numeric',month:'long',year:'numeric'});
 calSheet('<div class="life-detail-mark '+r.color+'">'+lifeGlyph(r.symbol)+'</div><div class="life-detail-tags">'+lifePill('Termin')+lifePill(r.name)+'</div><h2 id="lifeDetailHeading" tabindex="-1">'+esc(x.title)+'</h2>'+
  '<dl class="cos-facts cal-facts"><dt>Wann</dt><dd>'+esc(dateLine)+'<small>'+esc(x.time?x.time+'–'+calEnd(x)+' Uhr':'ganztägig')+'</small></dd>'+
  (x.recur?'<dt>Serie</dt><dd>↻ '+esc(PulseRecur.describe(x))+(x.exdates?.length?'<small>'+x.exdates.length+' ausgelassen</small>':'')+'</dd>':'')+
  (x.location?'<dt>Ort</dt><dd><a href="geo:0,0?q='+encodeURIComponent(x.location)+'">'+esc(x.location)+'</a></dd>':'')+
  (x.remind!=null?'<dt>Erinnerung</dt><dd>'+esc(calRemindText(x))+'</dd>':'')+'</dl>'+
  (x.body?'<div class="life-prose">'+esc(x.body)+'</div>':'')+
  '<div class="life-detail-actions">'+lifeButton('Bearbeiten',lifeCall('calEdit',id,start),'life-btn dark')+(x.recur?lifeButton('Nur diesen auslassen',lifeCall('calSkip',id,start),'life-btn'):'')+lifeButton(x.recur?'Ganze Serie löschen':'Löschen',lifeCall('calDelete',id),'life-textbtn danger')+'</div>'+
  '<div class="life-sectionhead"><h3>Sichere Erinnerung</h3></div><p class="life-footnote">Pulse erinnert dich, solange die App offen ist. Für wichtige Termine kannst du die Erinnerung zusätzlich im Handy-Kalender ablegen. Der klingelt auch, wenn Pulse geschlossen ist.</p><div class="cos-actions">'+lifeButton('.ics-Datei für den Handy-Kalender',lifeCall('calPhoneReminder',id,start),'life-textbtn')+'</div>');
}
function calSkip(id,date){const x=PulseLife.get(db,id);if(!x)return;if(lifeMutate(()=>PulseLife.update(db,id,{exdates:[...(x.exdates||[]),date]},new Date().toISOString()),'Termin am '+lifeDate(date,{day:'numeric',month:'short'})+' ausgelassen'))lifeCloseSheet()}
function calDelete(id){if(lifeMutate(()=>PulseLife.update(db,id,{status:'archived'},new Date().toISOString()),'Termin gelöscht · rückgängig möglich'))lifeCloseSheet()}
/* ---------- Editor ---------- */
function calRecurOptions(date,current){
 const wd=PulseRecur.weekday(date),WD=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],n=PulseRecur.nthOf(date),M=lifeDate(date,{day:'numeric',month:'long'});
 const opts=[['','Keine'],['daily','Täglich'],['weekdays','Werktags (Mo–Fr)'],['weekly','Wöchentlich'],['weekly2','Alle 2 Wochen'],['monthly','Monatlich am '+Number(date.slice(8))+'.'],['monthlyNth','Monatlich am '+n+'. '+WD[wd]]];
 if(PulseRecur.isLast(date))opts.push(['monthlyLast','Monatlich am letzten '+WD[wd]]);opts.push(['yearly','Jährlich am '+M]);
 return opts.map(([v,l])=>'<option value="'+v+'"'+(v===current?' selected':'')+'>'+esc(l)+'</option>').join('');
}
function calRecurKey(r){if(!r)return '';if(r.freq==='weekly'&&r.interval===2)return 'weekly2';if(r.freq==='monthlyNth'&&r.nth===-1)return 'monthlyLast';return r.freq}
function calEdit(id,date){
 const x=id?PulseLife.get(db,id):null;if(id&&!x)return;
 const d=x?x.date:(PulseLife.validDate(date||'')?date:key()),allDay=x?!x.time:false,time=x?.time||(()=>{const h=new Date().getHours()+1;return String(Math.min(h,22)).padStart(2,'0')+':00'})();
 const end=x&&x.time?calEnd(x):String(Math.min(Number(time.slice(0,2))+1,23)).padStart(2,'0')+':'+time.slice(3);
 const r=x?.recur||null;calEditRecurDays=r?.freq==='weekly'?[...r.byday]:null;
 calSheet('<h2 id="lifeDetailHeading" tabindex="-1">'+(x?'Termin bearbeiten':'Neuer Termin')+'</h2>'+(x?.recur?'<p class="life-footnote">Änderungen gelten für die ganze Serie.</p>':'')+
  '<form class="cal-form" onsubmit="event.preventDefault();calSave('+(x?"'"+esc(x.id)+"'":"''")+')">'+
  '<label class="life-name-field">Titel<input id="calTitle" required maxlength="180" value="'+esc(x?.title||'')+'" placeholder="z. B. Bandprobe"/></label>'+
  '<label class="cal-check"><input type="checkbox" id="calAllDay"'+(allDay?' checked':'')+' onchange="calSync()"/> Ganztägig</label>'+
  '<div class="cal-grid2"><label class="life-name-field cal-full">Datum<input id="calDate" type="date" required value="'+esc(d)+'" onchange="calSync()"/></label>'+
  '<label class="life-name-field cal-timed">Beginn<input id="calStart" type="time" value="'+esc(time)+'" onchange="calSyncEnd()"/></label>'+
  '<label class="life-name-field cal-timed">Ende<input id="calEnd" type="time" value="'+esc(end)+'"/></label>'+
  '<label class="life-name-field cal-allday">Bis (mehrtägig)<input id="calEndDate" type="date" value="'+esc(x?.endDate||'')+'"/></label></div>'+
  '<label class="life-name-field">Wiederholung<select id="calRecur" onchange="calSync()">'+calRecurOptions(d,calRecurKey(r))+'</select></label>'+
  '<div id="calDays" class="vault-chips cal-days"></div>'+
  '<div class="cal-grid2" id="calUntilRow"><label class="life-name-field">Endet<select id="calUntilMode" onchange="calSync()"><option value="">Nie</option><option value="date"'+(r?.until?' selected':'')+'>Am Datum</option></select></label><label class="life-name-field" id="calUntilWrap">Letzter Termin<input id="calUntil" type="date" value="'+esc(r?.until||'')+'"/></label></div>'+
  '<label class="life-name-field">Ort<input id="calLocation" maxlength="200" value="'+esc(x?.location||'')+'" placeholder="optional"/></label>'+
  '<label class="life-name-field">Erinnerung<select id="calRemind"></select></label>'+
  '<label class="life-name-field">Raum<select id="calRoom">'+PulseLife.ROOMS.map(rm=>'<option value="'+rm.id+'"'+((x?.room||'alltag')===rm.id?' selected':'')+'>'+esc(rm.name)+'</option>').join('')+'</select></label>'+
  '<label class="life-name-field">Notiz<textarea id="calBody" rows="3" placeholder="optional">'+esc(x?.body||'')+'</textarea></label>'+
  '<div class="life-detail-actions"><button type="submit" class="life-btn dark">Speichern</button>'+lifeButton('Abbrechen','lifeCloseSheet()','life-btn')+'</div></form>','#calTitle');
 calSync(x?.remind);
}
function calSyncEnd(){const s=document.getElementById('calStart').value,e=document.getElementById('calEnd');if(!s)return;const h=Math.min(Number(s.slice(0,2))+1,23);e.value=String(h).padStart(2,'0')+':'+s.slice(3)}
function calSync(remind){
 const allDay=document.getElementById('calAllDay').checked,date=document.getElementById('calDate').value||key(),rec=document.getElementById('calRecur');
 document.querySelectorAll('.cal-timed').forEach(e=>e.hidden=allDay);document.querySelectorAll('.cal-allday').forEach(e=>e.hidden=!allDay);
 const cur=rec.value;rec.innerHTML=calRecurOptions(date,cur);if(rec.value!==cur)rec.value=cur.startsWith('monthly')&&cur!=='monthly'?'monthlyNth':'';
 const weekly=rec.value==='weekly'||rec.value==='weekly2';
 if(weekly&&!calEditRecurDays)calEditRecurDays=[PulseRecur.weekday(date)];
 const days=document.getElementById('calDays');days.hidden=!weekly;
 days.innerHTML=weekly?[1,2,3,4,5,6,0].map(i=>'<button type="button" aria-pressed="'+calEditRecurDays.includes(i)+'" onclick="'+lifeCall('calToggleDay',i)+'">'+['So','Mo','Di','Mi','Do','Fr','Sa'][i]+'</button>').join(''):'';
 document.getElementById('calUntilRow').hidden=!rec.value;document.getElementById('calUntilWrap').hidden=document.getElementById('calUntilMode').value!=='date';
 const sel=document.getElementById('calRemind'),prev=remind!==undefined?(remind==null?'':String(remind)):sel.value;
 const list=allDay?CAL_REMIND_ALLDAY:CAL_REMIND_TIMED;sel.innerHTML=list.map(([v,l])=>'<option value="'+v+'">'+esc(l)+'</option>').join('');sel.value=list.some(([v])=>v===prev)?prev:'';
}
function calToggleDay(i){const set=new Set(calEditRecurDays||[]);if(set.has(i)&&set.size>1)set.delete(i);else set.add(i);calEditRecurDays=[...set];calSync()}
function calSave(id){
 const v=k=>document.getElementById(k)?.value||'',allDay=document.getElementById('calAllDay').checked,date=v('calDate');
 const fields={kind:'event',title:v('calTitle').trim(),date,room:v('calRoom'),location:v('calLocation'),body:v('calBody'),remind:v('calRemind')===''?null:Number(v('calRemind'))};
 if(allDay){fields.time='';fields.duration=Number(PulseLife.get(db,id)?.duration)||60;fields.endDate=v('calEndDate')}
 else{const s=v('calStart'),e=v('calEnd');if(!s)return toast('Bitte eine Startzeit angeben oder „Ganztägig“ wählen.');let min=(Date.parse('2000-01-01T'+(e||s)+':00Z')-Date.parse('2000-01-01T'+s+':00Z'))/60000;if(min<=0)min+=1440;fields.time=s;fields.duration=Math.min(1440,min||60);fields.endDate=''}
 const k=v('calRecur');
 if(k){const freq={weekly2:'weekly',monthlyLast:'monthlyNth'}[k]||k;fields.recur={freq,interval:k==='weekly2'?2:1,until:v('calUntilMode')==='date'?v('calUntil'):'',...(freq==='weekly'?{byday:calEditRecurDays||[PulseRecur.weekday(date)]}:{}),...(k==='monthlyLast'?{nth:-1}:{})}}else fields.recur=null;
 const now=new Date().toISOString(),newId=id||uid('life');
 const ok=lifeMutate(()=>id?PulseLife.update(db,id,fields,now):PulseLife.create(db,fields,newId,now),id?'Termin gespeichert':'Termin angelegt');
 if(!ok)return;lifeCloseSheet();pulseTap();cosmosDay=date;renderCosmos();
 if(fields.remind!=null)calAskPermission();
}
/* ---------- Import / Export ---------- */
function calMenu(){
 const perm=typeof Notification==='undefined'?'unsupported':Notification.permission;
 calSheet('<h2 id="lifeDetailHeading" tabindex="-1">Kalender</h2>'+
  '<div class="life-sectionhead"><h3>Von Google Kalender umziehen</h3></div><p class="life-footnote">Am Computer in Google Kalender: Einstellungen → Importieren und exportieren → Exportieren. Die ZIP-Datei entpacken und die .ics-Datei hier auswählen. Wiederholungen, Orte, Notizen und Erinnerungen werden übernommen, doppelte Termine erkannt.</p>'+
  '<label class="life-btn dark cal-file">.ics-Datei importieren<input class="srOnly" type="file" accept=".ics,text/calendar" onchange="calImportFile(this.files[0]);this.value=\'\'"/></label>'+
  '<div class="life-sectionhead"><h3>Exportieren</h3></div><p class="life-footnote">Alle Termine als .ics-Datei, z. B. für einen anderen Kalender oder als Sicherung.</p>'+lifeButton('Termine exportieren','calExport()','life-btn')+
  '<div class="life-sectionhead"><h3>Erinnerungen</h3></div><p class="life-footnote">'+(perm==='granted'?'Benachrichtigungen sind erlaubt.':perm==='denied'?'Benachrichtigungen sind in Chrome blockiert. Erlauben über das Schloss-Symbol neben der Adresse oder in den App-Einstellungen von Android.':perm==='unsupported'?'Dieser Browser unterstützt keine Benachrichtigungen.':'Benachrichtigungen sind noch nicht erlaubt.')+' Erinnerungen kommen, solange Pulse offen ist oder kurz im Hintergrund lief. Ist Pulse ganz geschlossen, kann eine Web-App sich nicht von selbst melden.</p>'+(perm==='default'?lifeButton('Benachrichtigungen erlauben','calAskPermission(true)','life-btn'):'')+(perm==='granted'?lifeButton('Test-Benachrichtigung','calNotify(\'Pulse\',\'So sehen Erinnerungen aus.\',\'test\')','life-btn'):''));
}
let calPendingImport=null;
async function calImportFile(file){
 if(!file)return;let text='';try{text=await file.text()}catch(_){return toast('Die Datei konnte nicht gelesen werden.')}
 let res;try{res=PulseICS.parse(text,{target:CAL_TZ})}catch(e){return toast('Diese Datei ist keine lesbare .ics-Datei.')}
 if(!res.events.length)return toast('In der Datei wurden keine Termine gefunden.');
 const cutoff=PulseLife.offset(key(),-365),old=res.events.filter(e=>!e.recur&&(e.endDate||e.date)<cutoff).length;
 const existing=PulseLife.list(db,{archived:true}).filter(x=>x.kind==='event'),known=new Set(existing.map(x=>x.ics).filter(Boolean)),sig=new Set(existing.map(x=>x.title+'|'+x.date+'|'+x.time));
 const fresh=res.events.filter(e=>!(e.ics&&known.has(e.ics))&&!sig.has(e.title+'|'+e.date+'|'+e.time));
 calPendingImport={events:fresh,cutoff};
 calSheet('<h2 id="lifeDetailHeading" tabindex="-1">Termine importieren</h2><dl class="cos-facts"><dt>Gefunden</dt><dd>'+res.events.length+' Termine<small>davon '+res.events.filter(e=>e.recur).length+' Serien</small></dd><dt>Schon da</dt><dd>'+(res.events.length-fresh.length)+'</dd><dt>Älter als 1 Jahr</dt><dd>'+old+'</dd>'+(res.simplified?'<dt>Vereinfacht</dt><dd>'+res.simplified+'<small>Seltene Wiederholungsregeln wurden vereinfacht übernommen. Bitte diese Serien kurz prüfen.</small></dd>':'')+'</dl>'+
  '<label class="life-name-field">In Raum<select id="calImportRoom">'+PulseLife.ROOMS.map(rm=>'<option value="'+rm.id+'">'+esc(rm.name)+'</option>').join('')+'</select></label>'+
  '<div class="life-detail-actions">'+lifeButton('Ab einem Jahr zurück importieren','calImportRun(true)','life-btn dark')+lifeButton('Alles importieren','calImportRun(false)','life-btn')+'</div><p class="life-footnote">Der Import lässt sich mit ↶ oben in einem Schritt rückgängig machen.</p>');
}
async function calImportRun(recentOnly){
 const p=calPendingImport;if(!p)return;calPendingImport=null;await backupSnapshot('vor-kalenderimport').catch(()=>{});const room=document.getElementById('calImportRoom')?.value||'alltag',now=new Date().toISOString();
 const list=recentOnly?p.events.filter(e=>e.recur?(!e.recur.until||e.recur.until>=p.cutoff):(e.endDate||e.date)>=p.cutoff):p.events;let n=0,bad=0;
 const ok=lifeMutate(()=>{for(const e of list){try{PulseLife.create(db,{...e,room},uid('life'),now);n++}catch(_){bad++}}},'Import');
 if(ok){lifeCloseSheet();renderCosmos();toast(n+(n===1?' Termin':' Termine')+' importiert'+(bad?', '+bad+' fehlerhaft übersprungen':''),'Rückgängig')}
}
function calDownload(text,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type:'text/calendar'}));a.href=url;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),2000)}
function calExport(){const items=PulseLife.list(db).filter(x=>x.kind==='event');if(!items.length)return toast('Noch keine Termine.');calDownload(PulseICS.build(items,{tz:CAL_TZ}),'PULSE_Kalender_'+key()+'.ics');toast(items.length+(items.length===1?' Termin':' Termine')+' exportiert')}
function calPhoneReminder(id,start){const x=PulseLife.get(db,id);if(!x)return;const one={...x,date:start,recur:null,exdates:[],endDate:x.endDate?PulseLife.offset(start,PulseRecur.diff(x.date,x.endDate)):'',remind:x.remind??(x.time?15:-480),ics:(x.ics||x.id)+'-'+start};calDownload(PulseICS.build([one],{tz:CAL_TZ}),'Termin_'+start+'.ics');toast('Datei mit dem Handy-Kalender öffnen, dann speichern.')}
/* ---------- Reminders while Pulse is open ---------- */
function calAskPermission(force){if(typeof Notification==='undefined')return;if(Notification.permission==='default'){Notification.requestPermission().then(p=>{if(p==='granted')toast('Erinnerungen sind jetzt erlaubt.');if(force)calMenu()}).catch(()=>{})}}
function calNotify(title,body,tag){
 toast(title+(body?' · '+body:''));pulseSound('chime');pulseTap([20,80,20]);
 if(typeof Notification==='undefined'||Notification.permission!=='granted')return;
 const opts={body,tag,icon:'icons/icon-192.png',badge:'icons/icon-192.png',data:{url:'./#calendar'}};
 (navigator.serviceWorker?.ready||Promise.reject()).then(r=>r.showNotification(title,opts)).catch(()=>{try{new Notification(title,opts)}catch(_){}});
}
function calRemindTick(){
 if(!db)return;const now=Date.now(),today=key(),sent=db.uiPrefs.reminded=db.uiPrefs.reminded||{};let changed=false;
 for(const k of Object.keys(sent))if(now-sent[k]>4*864e5){delete sent[k];changed=true}
 for(const x of PulseLife.list(db))if(x.kind==='event'&&x.remind!=null)for(const s of PulseRecur.starts(x,PulseLife.offset(today,-1),PulseLife.offset(today,2),5)){
  const startMs=new Date(s+'T'+(x.time||'00:00')+':00').getTime(),at=startMs-x.remind*60000,k=x.id+'|'+s;
  const endMs=x.time?startMs+(x.duration||60)*60000:startMs+864e5;
  if(now>=at&&now<Math.max(endMs,at+3600000)&&!sent[k]){sent[k]=now;changed=true;calNotify(x.title,(x.time?(s===today?'Heute ':lifeDate(s,{weekday:'short'})+' ')+x.time+' Uhr':lifeDate(s,{weekday:'long',day:'numeric',month:'short'}))+(x.location?' · '+x.location:''),k)}
 }
 if(changed)save();
}
setInterval(()=>{if(document.visibilityState==='visible')calRemindTick()},30000);
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='visible')setTimeout(calRemindTick,800)});
setTimeout(calRemindTick,2500);
