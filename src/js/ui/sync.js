// SOURCE: ui/sync.js
/* Abgleich between devices (phone and Quest each keep their own PULSE): make a package here, read the
   package of the other device, see what would change, merge. A whole backup can be merged too. */
let syncPending=null;
const syncFrom=d=>({Quest:'von der Quest',Handy:'vom Handy',Computer:'vom Computer'})[d]||(d?'von '+d:'');
function syncDevice(){const u=navigator.userAgent||'';return /OculusBrowser|Quest|Pacific/i.test(u)?'Quest':/Android|iPhone|iPad|Mobile/i.test(u)?'Handy':'Computer'}
function syncOpen(){
 syncPending=null;
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 const last=db.sync&&db.sync.last;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Mit anderem Gerät abgleichen</h2>'+
  '<p class="life-detail-intro">Handy und Quest haben je einen eigenen PULSE-Speicher. Ein Abgleich bringt beide auf denselben Stand: Einträge und Notizbuch, Sigillen, Tarot, Videos und behaltene Karten. Körperdaten und Songtexte bleiben, wo sie sind.</p>'+
  '<ol class="sync-steps"><li>Hier ein Paket erstellen und teilen, zum Beispiel in Google Drive.</li><li>Auf dem anderen Gerät das Paket einlesen und zusammenführen.</li><li>Danach dasselbe andersherum. Dann haben beide alles.</li></ol>'+
  '<div class="life-detail-actions">'+lifeButton('Paket erstellen','syncExport()','life-btn dark')+'<label class="life-btn">Paket einlesen<input class="srOnly" type="file" accept=".json,.txt,application/json,text/plain" onchange="syncPick(this.files[0]);this.value=\'\'"/></label></div>'+
  '<div id="syncResult" aria-live="polite"></div>'+
  (last&&last.at?'<p class="life-subtle">Letzter Abgleich: '+esc(backupWhen(last.at))+(last.direction==='in'?' · eingelesen':' · Paket erstellt')+'</p>':'')+
  '<p class="life-footnote">Neues kommt dazu. Gibt es denselben Eintrag auf beiden Geräten, gilt die neuere Fassung; Ladungen von Sigillen werden zusammengezählt. Gelöschtes bleibt gelöscht. Vor dem Zusammenführen legt PULSE eine Sicherung an (Einstellungen → Zeitreise). Auf der Quest: das Paket im Browser in Google Drive öffnen, herunterladen und hier einlesen. Auch ein PULSE-Backup lässt sich so zusammenführen, statt alles zu ersetzen; übernommen werden dabei nur die oben genannten Bereiche.</p>';
 if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
}
function syncMark(direction,device=''){const s=PulseSync.ensure(db);s.last={at:new Date().toISOString(),direction,device};save()}
async function syncExport(){
 const device=syncDevice(),pkg=PulseSync.pack(db,{device,now:new Date().toISOString(),app:'31.0.0'});
 let photos=0;
 try{const ids=PulseSync.photoIds(pkg.data);if(ids.length){pkg.photos=await PulsePhotos.exportSome(ids);photos=Object.keys(pkg.photos).length}}catch(_){toast('Bilder konnten nicht mit ins Paket. Die Einträge sind drin.')}
 const text=JSON.stringify(pkg),name='PULSE_abgleich_'+device+'_'+key();
 const file=typeof File==='function'?new File([text],name+'.txt',{type:'text/plain'}):null;
 const done=how=>{syncMark('out',device);toast(how+(photos?' · mit '+photos+(photos===1?' Bild':' Bildern'):''))};
 if(file&&navigator.canShare?.({files:[file]})){
  try{await navigator.share({files:[file],title:'PULSE-Abgleich',text:'PULSE-Abgleich '+syncFrom(device)});done('Paket geteilt');return}
  catch(e){if(e&&e.name==='AbortError')return}
 }
 PulseStorageUI.download(text,name+'.json');done('Paket als Datei gespeichert');
}
function syncPick(file){
 if(!file)return;const box=document.getElementById('syncResult');if(box)box.innerHTML='<p class="life-subtle">Wird gelesen …</p>';
 const r=new FileReader();r.onerror=()=>{if(box)box.innerHTML='';toast('Die Datei ließ sich nicht lesen.')};
 r.onload=()=>{try{
  let o;try{o=JSON.parse(String(r.result||''))}catch(_){throw Error('Diese Datei ist kein PULSE-Paket.')}
  const photos=o&&o.photos&&typeof o.photos==='object'&&!Array.isArray(o.photos)?o.photos:null;
  let src;
  if(o&&o.kind==='abgleich')src=PulseSync.read(o);
  else{if(o&&typeof o==='object')delete o.photos;src={kind:'backup',data:storage.prepareImport(JSON.stringify(o)),device:'',exportedAt:String(o&&o.exportedAt||'')}}
  syncPending={src,photos,prev:PulseSync.preview(db,src,new Date().toISOString())};
  syncShowPreview();
 }catch(e){if(box)box.innerHTML='<p class="life-subtle">'+esc(e.message)+'</p>';toast(e.message)}};
 r.readAsText(file);
}
function syncLines(r){
 const n=(v,one,many)=>v+' '+(v===1?one:many),both=(a,b)=>[a,b].filter(Boolean).join(', '),L=[];
 if(r.life.added||r.life.updated)L.push(['Einträge',both(r.life.added&&n(r.life.added,'neuer','neue'),r.life.updated&&n(r.life.updated,'neuere Fassung','neuere Fassungen'))]);
 if(r.sigils.added||r.sigils.updated)L.push(['Sigillen',both(r.sigils.added&&n(r.sigils.added,'neue','neue'),r.sigils.updated&&n(r.sigils.updated,'ergänzt','ergänzt'))]);
 if(r.tarot.days||r.tarot.notes||r.tarot.today)L.push(['Tarot',both(r.tarot.days&&n(r.tarot.days,'Tageskarte','Tageskarten'),r.tarot.notes&&n(r.tarot.notes,'eigene Bedeutung','eigene Bedeutungen'))||'die heutige Karte']);
 if(r.videos.added||r.videos.updated)L.push(['Videos',both(r.videos.added&&n(r.videos.added,'neues','neue'),r.videos.updated&&n(r.videos.updated,'neuere Fassung','neuere Fassungen'))]);
 if(r.shelves)L.push(['Regale',n(r.shelves,'neues','neue')]);
 if(r.kept)L.push(['Behaltene Karten',n(r.kept,'neue','neue')]);
 if(r.removed)L.push(['Entfernt',n(r.removed,'Sache, die drüben gelöscht wurde','Sachen, die drüben gelöscht wurden')]);
 if(r.name)L.push(['Name','wird übernommen']);
 return L;
}
const syncList=r=>'<ul class="sync-list">'+syncLines(r).map(([a,b])=>'<li><span>'+esc(a)+'</span>'+esc(b)+'</li>').join('')+'</ul>';
function syncShowPreview(){
 const p=syncPending,box=document.getElementById('syncResult');if(!p||!box)return;
 const from=p.src.kind==='backup'?'PULSE-Backup':'Paket'+(p.src.device?' '+syncFrom(p.src.device):'');
 const when=p.src.exportedAt?' · '+backupWhen(p.src.exportedAt):'',total=PulseSync.changes(p.prev);
 box.innerHTML='<div class="sync-preview"><b>'+esc(from+when)+'</b>'+(total?syncList(p.prev)+(p.prev.skipped?'<p class="life-subtle">'+p.prev.skipped+' unlesbare Datensätze werden übersprungen.</p>':'')+
  '<div class="life-detail-actions">'+lifeButton('Zusammenführen','syncApply()','life-btn dark')+lifeButton('Abbrechen','syncCancel()','life-btn')+'</div>':'<p>Nichts Neues darin. Für diese Bereiche ist hier schon alles da.</p>')+'</div>';
}
function syncCancel(){syncPending=null;const box=document.getElementById('syncResult');if(box)box.innerHTML=''}
async function syncApply(){
 const p=syncPending;if(!p)return;syncPending=null;
 const box=document.getElementById('syncResult');if(box)box.innerHTML='<p class="life-subtle">Wird zusammengeführt …</p>';
 await backupSnapshot('vor-abgleich').catch(()=>{});
 const before=JSON.stringify(db);let r;
 try{r=PulseSync.merge(db,p.src,new Date().toISOString());PulseSigil.normalize(db);PulseVault.normalize(db);PulseDeck.ensure(db);PulseSync.ensure(db).last={at:new Date().toISOString(),direction:'in',device:p.src.device||''}}
 catch(e){db=JSON.parse(before);if(box)box.innerHTML='';toast('Abgleich fehlgeschlagen: '+e.message);return}
 if(p.photos&&r.photos.length){const want={};for(const id of r.photos)if(typeof p.photos[id]==='string')want[id]=p.photos[id];try{await PulsePhotos.importAll(want)}catch(_){toast('Einige Bilder ließen sich nicht übernehmen.')}}
 if(!save()){db=JSON.parse(before);if(box)box.innerHTML='';return}
 renderLife();
 if(box)box.innerHTML='<div class="sync-preview done"><b>Zusammengeführt.</b>'+syncList(r)+'<p>Damit beide Geräte gleich sind: jetzt hier ein Paket erstellen und auf dem anderen Gerät einlesen.</p><div class="life-detail-actions">'+lifeButton('Paket für das andere Gerät','syncExport()','life-btn dark')+'</div></div>';
 toast('Abgleich fertig');
}
