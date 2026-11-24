// SOURCE: ui/app-shell.js
/* Installed-app behaviour: shared content, shortcuts, durable storage, backup reminders. */
function lifeReceiveShare(fields){
 if(!lifeState().draft)return lifeCompose(fields);
 const id=uid('life');if(lifeMutate(()=>PulseLife.create(db,{kind:'note',room:'alltag',...fields},id,new Date().toISOString()),'Geteilten Inhalt gespeichert'))lifeOpenItem(id);
}
/* Photos shared from another app: the service worker left them in a small cache. Ask once what they are. */
let sharedPhotoFiles=[],sharedPhotoMeta={};
async function takeSharedPhotos(n){
 const out=[];try{const c=await caches.open('pulse-share');for(let i=0;i<Math.min(8,n);i++){const r=await c.match('./__share/'+i);if(r){const b=await r.blob();out.push(new File([b],'geteilt-'+(i+1)+'.jpg',{type:b.type||'image/jpeg'}))}}for(const k of await c.keys())await c.delete(k)}catch(_){}
 return out;
}
function sharedPhotoSheet(files,meta){
 sharedPhotoFiles=files;sharedPhotoMeta=meta;const n=files.length;
 libDetailShell('<span class="life-kicker">Geteilt</span><h2 id="lifeDetailHeading" tabindex="-1">'+(n===1?'Ein Foto':n+' Fotos')+'</h2><div class="share-photos">'+files.slice(0,4).map(()=>'<img alt=""/>').join('')+'</div>'+
  '<p class="life-detail-intro">Was ist es?</p><div class="share-photo-actions">'+lifeButton('Mahlzeit',"sharedPhotoAs('meal')",'life-btn dark')+lifeButton(n===1?'Notiz mit Foto':'Notiz mit Fotos',"sharedPhotoAs('note')",'life-btn')+'</div>');
 document.querySelectorAll('#lifeDetail .share-photos img').forEach((img,i)=>{img.src=URL.createObjectURL(files[i])});
}
async function sharedPhotoAs(kind){
 const files=sharedPhotoFiles,meta=sharedPhotoMeta;sharedPhotoFiles=[];if(!files.length)return lifeCloseSheet();
 if(kind==='meal'){lifeCloseSheet();await mealPhotoSave(files[0],{note:meta.text||''});return}
 const ids=[];for(const f of files){try{ids.push(await PulsePhotos.add(f))}catch(e){toast(e.message)}}
 if(!ids.length)return;
 const link=/^https?:\/\//i.test(meta.url||'')?meta.url:((meta.text||'').match(/https?:\/\/\S+/)||[''])[0],body=(meta.text||'').replace(link,'').trim();
 const id=uid('life');lifeCloseSheet();
 if(lifeMutate(()=>PulseLife.create(db,{kind:'note',room:'alltag',title:(meta.title||body.split('\n')[0]||'Geteiltes Foto').slice(0,120),body:meta.title?body:body.split('\n').slice(1).join('\n').trim(),url:link,photos:ids},id,new Date().toISOString()),'Foto gespeichert'))lifeOpenItem(id);
}
function handleLaunchParams(){
 const q=new URLSearchParams(location.search);if(![...q.keys()].length)return;
 const action=q.get('action'),title=(q.get('title')||'').trim(),text=(q.get('text')||'').trim(),url=(q.get('url')||'').trim(),shared=Number(q.get('shared'))||0;
 history.replaceState(history.state,'',location.pathname+location.hash);
 if(shared>0){setTimeout(async()=>{const files=await takeSharedPhotos(shared);if(files.length)sharedPhotoSheet(files,{title,text,url});else toast('Das geteilte Foto ist nicht angekommen. Versuch es noch einmal.')},200);return}
 setTimeout(()=>{
  if(title||text||url){const link=/^https?:\/\//i.test(url)?url:(text.match(/https?:\/\/\S+/)||[''])[0];const video=PulseVideo.parseAny(link);if(video){const clean=PulseVideo.shareTitle(title)||PulseVideo.shareTitle(text.replace(link,'').trim().split('\n')[0]),rest=(clean+' '+text.replace(link,'')).trim();const x=vaultAdd(link,{title:clean,room:PulseVideo.room(rest,video)});if(x){lifeOpenVideos();vaultOpen(x.id)}return}
  const name=title||(text.replace(link,'').trim().split('\n')[0]||(video?'YouTube-Video':'Geteilt')),room=video?PulseVideo.room(title+' '+text,video):'';lifeReceiveShare({kind:'note',title:name.slice(0,120),body:title?text.replace(link,'').trim():text.replace(link,'').trim().split('\n').slice(1).join('\n').trim(),url:link,...(room?{room}:{})})}
  else if(action==='compose')lifeQuick();
  else if(action==='voice')lifeComposeVoice();
  else if(action==='food')goView('nutrition');
  else if(action==='training')openTodaysTraining();
  else if(action==='tarot')lifeOpenSpaces('sinn');
  else if(action==='stapel')lifeOpenStapel();
  else if(action==='raum')lifeOpenRaum();
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
 const every=backupEvery();if(hasData&&every&&(age===null||age>=every))rows.push('<button type="button" class="life-today-row" onclick="backupShare()"><span class="peach">'+lifeGlyph('arch')+'</span><span class="grow"><b>Backup teilen</b><small>'+(age===null?'Noch nie außerhalb des Handys gesichert':'Letztes Backup '+vorTagen(age))+' · Google Drive, Mail …</small></span><i aria-hidden="true">›</i></button>');
 return rows.length?'<div class="life-today-list">'+rows.join('')+'</div>':'';
}


