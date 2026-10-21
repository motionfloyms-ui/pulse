// SOURCE: ui/backup.js
/* Data safety: automatic daily snapshots inside the browser ("Zeitreise", last 14 days) and a backup
   that leaves the phone with one tap (share sheet: Google Drive, Mail, Signal …). */
const BACKUP_DAYS=14,BACKUP_OTHER=5;
let backupLastSnap=0,backupConfirm=null;
async function backupSnapshot(kind='day'){
 if(!PulseIDB.supported||!db)return;
 const now=new Date(),id=kind==='day'?'day-'+key():kind+'-'+now.toISOString(),text=JSON.stringify(db);
 const sum={items:(db.life?.items||[]).length,videos:(db.videos?.items||[]).length,songs:(db.songs?.items||[]).length,workouts:(db.workouts||[]).length,meals:(db.meals||[]).length};
 await PulseIDB.putSnapshot({id,kind,date:key(),savedAt:now.toISOString(),size:text.length,sum,text});
 const list=await PulseIDB.listSnapshots(),days=list.filter(s=>s.kind==='day'),other=list.filter(s=>s.kind!=='day');
 for(const s of [...days.slice(BACKUP_DAYS),...other.slice(BACKUP_OTHER)])await PulseIDB.deleteSnapshot(s.id);
 backupLastSnap=Date.now();
}
/* The day's snapshot follows the day: refreshed when Pulse goes to the background (at most every 10 min). */
document.addEventListener('visibilitychange',()=>{if(document.visibilityState==='hidden'&&db&&Date.now()-backupLastSnap>600000)backupSnapshot('day').catch(()=>{})});
const BACKUP_KIND={day:'Tagesstand','vor-import':'Vor einem Import','vor-wiederherstellung':'Vor einer Wiederherstellung','vor-kalenderimport':'Vor einem Kalender-Import'};
function backupWhen(iso){const d=iso.slice(0,10),t=new Date(iso).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});return (d===key()?'Heute':d===PulseLife.offset(key(),-1)?'Gestern':lifeDate(d,{weekday:'short',day:'numeric',month:'short'}))+', '+t}
async function backupTimeline(){
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Zeitreise</h2><p class="life-detail-intro">Pulse legt jeden Tag automatisch eine Sicherung im Browser ab und behält die letzten '+BACKUP_DAYS+' Tage, dazu Stände vor Importen. Damit holst du einen früheren Stand zurück, z. B. nach einem versehentlichen Löschen.</p><div id="backupList"><p class="life-none">Wird geladen …</p></div><p class="life-footnote">Diese Sicherungen liegen auf diesem Handy. Gegen Verlust oder Defekt des Handys hilft nur ein Backup außerhalb, über „Backup teilen“.</p>';
 if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
 let list=[];try{list=PulseIDB.supported?await PulseIDB.listSnapshots():[]}catch(_){}
 const box=document.getElementById('backupList');if(!box)return;
 box.innerHTML=list.length?list.map(s=>{const n=s.sum||{};return '<div class="backup-row"><span><b>'+esc(backupWhen(s.savedAt))+'</b><small>'+esc(BACKUP_KIND[s.kind]||'Sicherung')+' · '+[n.items+' Einträge',n.videos?n.videos+' Videos':'',n.songs?n.songs+' Songs':'',n.workouts?n.workouts+' Sätze':''].filter(Boolean).join(' · ')+'</small></span>'+(backupConfirm===s.id?lifeButton('Ja, zurückholen',lifeCall('backupRestore',s.id),'life-btn dark')+lifeButton('Nein','backupConfirm=null;backupTimeline()','life-textbtn'):lifeButton('Zurückholen',lifeCall('backupAsk',s.id),'life-btn'))+'</div>'}).join('')+(backupConfirm?'<p class="life-footnote">Dein jetziger Stand wird vorher selbst gesichert, du kannst also zurück.</p>':''):'<p class="life-none">Noch keine Sicherung. Die erste entsteht ein paar Sekunden nach dem Start.</p>';
}
function backupAsk(id){backupConfirm=id;backupTimeline()}
async function backupRestore(id){
 backupConfirm=null;const rec=await PulseIDB.getSnapshot(id).catch(()=>null);if(!rec)return toast('Diese Sicherung gibt es nicht mehr.');
 try{await backupSnapshot('vor-wiederherstellung');const restored=storage.restore(rec.text,db);db=restored;await storage.flush();location.reload()}catch(e){toast(e.message)}
}
/* ---------- Backup off the phone ---------- */
async function backupText(){
 let text=storage.exportText(db),n=0;
 try{const photos=await PulsePhotos.exportAll();n=Object.keys(photos).length;if(n){const o=JSON.parse(text);o.photos=photos;text=JSON.stringify(o)}}catch(_){toast('Fotos konnten nicht mitgesichert werden. Die Einträge sind im Backup.')}
 return {text,photos:n};
}
function backupMarkDone(){db.settings.lastExportAt=new Date().toISOString();save();renderLife()}
/* One tap: the share sheet offers Google Drive, Mail, Signal and so on. Chrome only shares some file
   types, so the backup travels as .txt (it is the same JSON; import accepts both). */
async function backupShare(){
 const {text,photos}=await backupText(),name='PULSE_backup_'+key();
 const file=typeof File==='function'?new File([text],name+'.txt',{type:'text/plain'}):null;
 if(file&&navigator.canShare?.({files:[file]})){
  try{await navigator.share({files:[file],title:'PULSE Backup',text:'PULSE Backup vom '+lifeDate(key(),{day:'numeric',month:'long',year:'numeric'})});backupMarkDone();toast(photos?'Backup geteilt · mit '+photos+(photos===1?' Foto':' Fotos'):'Backup geteilt');return}
  catch(e){if(e&&e.name==='AbortError')return}
 }
 PulseStorageUI.download(text,name+'.json');backupMarkDone();toast('Backup als Datei gespeichert. Am besten in Google Drive oder auf den Computer kopieren.');
}
function backupEvery(){const v=Number(db.uiPrefs.backupEvery);return Number.isFinite(v)&&v>=0?v:7}
function backupSetEvery(v){db.uiPrefs.backupEvery=Number(v);save();lifeSettings()}
function backupSettingsHTML(){
 const age=backupAgeDays(),every=backupEvery();
 return '<div class="life-sectionhead"><h3>Deine Daten</h3></div>'+storageUsageHTML()+
  '<div class="life-settings-row"><div><b>Zeitreise</b><p>Automatisch jeden Tag eine Sicherung im Browser, die letzten '+BACKUP_DAYS+' Tage.</p></div>'+lifeButton('Ansehen','backupTimeline()','life-btn')+'</div>'+
  '<div class="life-settings-row"><div><b>Backup außerhalb des Handys</b><p>'+(age===null?'Noch nie gesichert.':'Zuletzt vor '+age+(age===1?' Tag':' Tagen')+'.')+' Schützt vor Verlust oder Defekt des Handys: teilen in Google Drive, per Mail oder in einen Chat an dich selbst.</p></div>'+lifeButton('Backup teilen','backupShare()','life-btn dark')+'</div>'+
  '<div class="life-settings-row"><div><b>Erinnerung</b><p>Wann der Tag dich an ein neues Backup erinnert.</p></div><div class="life-seg" role="group" aria-label="Erinnerung an Backup">'+[[3,'3 Tage'],[7,'Woche'],[14,'2 Wochen'],[0,'Aus']].map(([v,l])=>'<button type="button" aria-pressed="'+(every===v)+'" onclick="backupSetEvery('+v+')">'+l+'</button>').join('')+'</div></div>'+
  '<div class="life-detail-actions">'+lifeButton('Als Datei herunterladen',lifeCall('exportPulse'),'life-btn')+'<label class="life-btn">Backup importieren<input class="srOnly" type="file" accept=".json,.txt,application/json,text/plain" onchange="importPulse(this.files[0]);this.value=\'\'"/></label></div>';
}
