// SOURCE: ui/app-shell.js
/* Installed-app behaviour: shared content, shortcuts, durable storage, backup reminders. */
function lifeReceiveShare(fields){
 if(!lifeState().draft)return lifeCompose(fields);
 const id=uid('life');if(lifeMutate(()=>PulseLife.create(db,{kind:'note',room:'alltag',...fields},id,new Date().toISOString()),'Geteilten Inhalt gespeichert'))lifeOpenItem(id);
}
function handleLaunchParams(){
 const q=new URLSearchParams(location.search);if(![...q.keys()].length)return;
 const action=q.get('action'),title=(q.get('title')||'').trim(),text=(q.get('text')||'').trim(),url=(q.get('url')||'').trim();
 history.replaceState(history.state,'',location.pathname+location.hash);
 setTimeout(()=>{
  if(title||text||url){const link=/^https?:\/\//i.test(url)?url:(text.match(/https?:\/\/\S+/)||[''])[0];const video=PulseVideo.parseAny(link);if(video){const clean=PulseVideo.shareTitle(title)||PulseVideo.shareTitle(text.replace(link,'').trim().split('\n')[0]),rest=(clean+' '+text.replace(link,'')).trim();const x=vaultAdd(link,{title:clean,room:PulseVideo.room(rest,video)});if(x){lifeOpenVideos();vaultOpen(x.id)}return}
  const name=title||(text.replace(link,'').trim().split('\n')[0]||(video?'YouTube-Video':'Geteilt')),room=video?PulseVideo.room(title+' '+text,video):'';lifeReceiveShare({kind:'note',title:name.slice(0,120),body:title?text.replace(link,'').trim():text.replace(link,'').trim().split('\n').slice(1).join('\n').trim(),url:link,...(room?{room}:{})})}
  else if(action==='compose')lifeQuick();
  else if(action==='voice')lifeComposeVoice();
  else if(action==='food')goView('nutrition');
  else if(action==='training')openTodaysTraining();
  else if(action==='tarot')lifeOpenSpaces('sinn');
  else if(action==='stapel')lifeOpenStapel();
 },200);
}
const isStandalone=()=>matchMedia('(display-mode: standalone)').matches;
async function requestDurableStorage(){try{if(navigator.storage?.persist&&!(await navigator.storage.persisted()))await navigator.storage.persist()}catch(_){}}
function backupAgeDays(){const t=db.settings.lastExportAt;return t?Math.floor((Date.now()-new Date(t).getTime())/86400000):null}
const REVIEW_LABEL={'food-capture':'Essen · Menge fehlt','drink-capture':'Getränk · Menge fehlt','workout-capture':'Training prüfen','workout-set':'Trainingssatz bestätigen','historical-review':'Datum prüfen'};
function lifeReviewItems(){return brainEntries().filter(e=>!e.record.done&&!e.record.deferred&&REVIEW_LABEL[e.type])}
function lifeReviewOpen(token){const e=brainEntries().find(x=>x.key===token);if(!e)return;if(/^workout/.test(e.type))return reviewWorkout(token);if(/capture$/.test(e.type))return reviewFood(token);
 const id=uid('life');lifeMutate(()=>{PulseLife.create(db,{kind:'note',room:'alltag',title:e.text.split('\n')[0].slice(0,180),body:e.text},id,new Date().toISOString());e.record.done=true;e.record.status='completed'},'In deine Sammlung übernommen');lifeOpenItem(id)}
function lifeReviewDismiss(token){const e=brainEntries().find(x=>x.key===token);if(!e)return;lifeMutate(()=>{e.record.done=true;e.record.status='cancelled'},'Verworfen')}
function lifeReviewRows(){
 const items=lifeReviewItems();if(!items.length)return '';
 return '<div class="life-sectionhead"><h2>Zu prüfen</h2><span class="life-subtle">'+items.length+' offen</span></div><div class="life-today-list">'+items.slice(0,4).map(e=>'<div class="life-today-row life-review-row"><span class="peach">'+lifeGlyph('arch')+'</span><button type="button" class="grow life-review-open" onclick="'+lifeCall('lifeReviewOpen',e.key)+'"><b>'+esc(e.text.slice(0,80))+'</b><small>'+esc(REVIEW_LABEL[e.type])+'</small></button><button type="button" class="life-review-x" aria-label="Verwerfen: '+esc(e.text.slice(0,40))+'" onclick="'+lifeCall('lifeReviewDismiss',e.key)+'">×</button></div>').join('')+'</div>';
}
function lifeSystemRows(date){
 if(date!==key())return '';const rows=[],age=backupAgeDays(),hasData=PulseLife.list(db).length>0||db.workouts.length>0;
 if(deferredInstallPrompt&&!isStandalone())rows.push('<button type="button" class="life-today-row" onclick="installPulse()"><span class="plum-soft">'+lifeGlyph('plus')+'</span><span class="grow"><b>PULSE als App installieren</b><small>Offline nutzbar, Daten dauerhaft geschützt</small></span><i aria-hidden="true">›</i></button>');
 const every=backupEvery();if(hasData&&every&&(age===null||age>=every))rows.push('<button type="button" class="life-today-row" onclick="backupShare()"><span class="peach">'+lifeGlyph('arch')+'</span><span class="grow"><b>Backup teilen</b><small>'+(age===null?'Noch nie außerhalb des Handys gesichert':'Letztes Backup vor '+age+' Tagen')+' · Google Drive, Mail …</small></span><i aria-hidden="true">›</i></button>');
 return rows.length?'<div class="life-today-list">'+rows.join('')+'</div>':'';
}


