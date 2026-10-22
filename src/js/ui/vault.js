// SOURCE: ui/vault.js
/* Videos tab: the collection with shelves, status, favourites, marked moments and milestones. */
let vaultFilter='all',vaultTab='list',vaultSort='neu',vaultShelf='',vaultRoom='',vaultChannel='',vaultQuery='',vaultReady=false,vaultOpenId=null,vaultLimit=60;
const vaultMetaTried=new Set();
const vaultNow=()=>new Date().toISOString();
const vaultThumbs=()=>db.uiPrefs.videoMeta!==false;
const vaultNo=n=>'#'+String(n).padStart(3,'0');
const vaultIsList=x=>x.kind==='playlist';
const vaultRef=(x,start)=>vaultIsList(x)?{list:x.list}:{id:x.vid,start:start==null?x.start:start};
function vaultImg(x,size){if(!vaultThumbs())return '';if(vaultIsList(x))return x.thumb||'';return 'https://i.ytimg.com/vi/'+x.vid+'/'+size+'default.jpg'}
const LIST_ICON='<svg class="vault-listicon" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7h11M4 12h11M4 17h7M17 14v6l4-3z"/></svg>';
function vaultPrepare(){
 if(vaultReady||!db)return;vaultReady=true;
 PulseVault.normalize(db);const moved=db.uiPrefs.vaultAdopted?0:PulseVault.adoptFromLife(db,vaultNow());if(!db.uiPrefs.vaultAdopted){db.uiPrefs.vaultAdopted=true;if(!moved)save()}
 if(moved){save();setTimeout(()=>toast(moved===1?'Ein Video ist in den neuen Videos-Tab umgezogen.':moved+' Videos sind in den neuen Videos-Tab umgezogen.'),900)}
}
function lifeOpenVideos(){goView('videos')}
function vaultSave(){if(!save())return false;renderVault();return true}
function vaultTry(fn){try{fn();return true}catch(e){toast(e.message);return false}}
/* Adds a link; duplicates open the existing video. Returns the item or null. */
function vaultAdd(url,extra={}){
 vaultPrepare();
 const before=PulseVault.ensure(db).items.length;let r;
 try{r=PulseVault.add(db,{url,...extra},vaultNow())}catch(e){toast(e.message);return null}
 if(r.duplicate){toast('Schon bei deinen Videos: '+vaultNo(r.item.no)+', seit '+lifeDate(r.item.addedAt.slice(0,10),{day:'numeric',month:'long'})+'.');pulseTap([10,40,10]);return r.item}
 if(!save())return null;
 const m=PulseVault.reached(before,before+1);
 if(m&&m>1){pulseSound('chime');pulseTap([12,60,18,60,24]);toast('Meilenstein: '+m+' Videos gesammelt.')}
 else{pulseSound('pop');pulseTap();toast(vaultNo(r.item.no)+' gesammelt')}
 vaultFetchMeta(r.item.id);renderVault();return r.item;
}
/* Title and channel via YouTube's oEmbed. Only when previews are switched on. */
/* YouTube's own oEmbed first; if the browser blocks it (CORS) or it fails, the open service noembed.com. */
const VAULT_META=[u=>'https://www.youtube.com/oembed?format=json&url='+encodeURIComponent(u),u=>'https://noembed.com/embed?url='+encodeURIComponent(u)];
let vaultMetaSource=0;
async function vaultMetaJson(u){
 for(let i=0;i<VAULT_META.length;i++){const k=(vaultMetaSource+i)%VAULT_META.length;
  try{const r=await fetch(VAULT_META[k](u),{credentials:'omit',referrerPolicy:'no-referrer'});if(!r.ok)continue;const j=await r.json();if(j&&!j.error&&(j.title||j.author_name)){vaultMetaSource=k;return j}}catch(_){}}
 return null;
}
async function vaultFetchMeta(id){
 const x=PulseVault.get(db,id);if(!x||!vaultThumbs()||vaultMetaTried.has(x.id)||!navigator.onLine)return;vaultMetaTried.add(x.id);
 try{
  const j=await vaultMetaJson(PulseVideo.watch(vaultRef(x,0)));if(!j)return;const y=PulseVault.get(db,id);if(!y)return;
  const fields={};if(!y.title&&j.title)fields.title=j.title;if(!y.channel&&j.author_name)fields.channel=j.author_name;if(vaultIsList(y)&&!y.thumb&&j.thumbnail_url)fields.thumb=String(j.thumbnail_url).replace(/^http:/,'https:');
  if(!y.room&&fields.title){const room=PulseVideo.room(fields.title,y);if(room)fields.room=room}
  if(Object.keys(fields).length){PulseVault.update(db,id,fields,vaultNow());vaultMetaChanged(id)}
 }catch(_){}
}
/* Titles arrive one by one; they are saved together, and a running video in the Stapel keeps playing. */
let vaultMetaTimer=null;
function vaultMetaChanged(id){
 if(typeof stapelMetaArrived==='function')stapelMetaArrived(id);if(vaultOpenId===id)vaultRefresh(id);
 clearTimeout(vaultMetaTimer);vaultMetaTimer=setTimeout(()=>{if(document.getElementById('appMain').dataset.view==='stapel'&&typeof stapelQuiet==='function')stapelQuiet();else{save();renderVault()}},700);
}
/* A small queue: at most three requests at a time, visible videos first (after an import there can be thousands). */
const vaultMetaQueue=[];let vaultMetaBusy=0;
function vaultQueueMeta(ids){for(const id of ids)if(!vaultMetaTried.has(id)&&!vaultMetaQueue.includes(id))vaultMetaQueue.push(id);vaultPump()}
function vaultPump(){while(vaultMetaBusy<3&&vaultMetaQueue.length){const id=vaultMetaQueue.shift();if(vaultMetaTried.has(id))continue;vaultMetaBusy++;Promise.resolve(vaultFetchMeta(id)).finally(()=>{vaultMetaBusy--;setTimeout(vaultPump,120)})}}
function vaultFillMissing(list){if(!vaultThumbs()||!navigator.onLine)return;const src=list||PulseVault.ensure(db).items;vaultQueueMeta(src.filter(x=>(!x.title||!x.channel||(vaultIsList(x)&&!x.thumb))&&!vaultMetaTried.has(x.id)).slice(0,list?30:4).map(x=>x.id))}
function vaultThumb(x,size='mq'){
 const inner='<span class="vault-no">'+vaultNo(x.no)+'</span>'+(vaultIsList(x)?'<span class="vault-short">'+LIST_ICON+'Playlist</span>':x.short?'<span class="vault-short">Short</span>':'')+(x.status==='gesehen'?'<span class="vault-seen" title="Gesehen">'+lifeGlyph('check')+'</span>':'');
 return '<span class="vault-thumb'+(x.short?' short':'')+(vaultIsList(x)?' list':'')+'">'+(vaultImg(x,size)?'<img src="'+esc(vaultImg(x,size))+'" alt="" loading="lazy" decoding="async" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<svg class="vault-play" viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg>'+inner+'</span>';
}
function vaultShelfName(id){const h=PulseVault.ensure(db).shelves.find(s=>s.id===id);return h?(h.emoji?h.emoji+' ':'')+h.name:''}
function vaultCard(x){
 const label=(vaultIsList(x)?'Playlist ':'')+(x.title||'Ohne Titel')+(x.channel?', '+x.channel:'')+(x.status==='gesehen'?', gesehen':', auf der Merkliste')+(x.fav?', Favorit':'');
 return '<button type="button" class="vault-card" aria-label="'+esc(vaultNo(x.no)+' '+label)+'" onclick="'+lifeCall('vaultOpen',x.id)+'">'+vaultThumb(x)+'<span class="vault-info"><b>'+(x.fav?'<span class="vault-star" aria-hidden="true">★</span> ':'')+esc(x.title||(vaultIsList(x)?'Playlist ':'Video ')+vaultNo(x.no))+'</b><small>'+esc([x.channel,x.shelves.map(vaultShelfName).join(' · ')].filter(Boolean).join(' · ')||(x.room?PulseLife.room(x.room).name:'Noch nicht einsortiert'))+'</small></span></button>';
}
function vaultSet(k,v){
 vaultLimit=60;
 if(k==='filter')vaultFilter=v;else if(k==='tab'){vaultTab=v;if(v!=='list'){vaultShelf='';vaultRoom='';vaultChannel=''}}else if(k==='sort')vaultSort=v;
 else if(k==='shelf'){vaultShelf=v;vaultRoom='';vaultChannel='';vaultTab='list'}else if(k==='room'){vaultRoom=v;vaultShelf='';vaultChannel='';vaultTab='list'}else if(k==='channel'){vaultChannel=v;vaultShelf='';vaultRoom='';vaultTab='list'}
 renderVault();
}
function vaultSearch(v){vaultQuery=v;vaultLimit=60;renderVaultResults()}
function vaultMore(){vaultLimit+=60;renderVaultResults()}
function vaultPaste(){const f=document.getElementById('vaultLink'),v=f?.value.trim();if(!v)return f?.focus();const link=(v.match(/https?:\/\/\S+/)||[v])[0];const rest=v.replace(link,'').trim(),x=vaultAdd(link,{title:rest,room:PulseVideo.room(rest,PulseVideo.parseAny(link)||{})});if(x){f.value='';if(!x.title||!x.shelves.length)vaultOpen(x.id)}}
async function vaultClipboard(){try{const t=await navigator.clipboard.readText();const f=document.getElementById('vaultLink');if(f){f.value=t;vaultPaste()}}catch(_){toast('Einfügen ist hier nicht erlaubt. Lang auf das Feld tippen und „Einfügen“ wählen.')}}
function vaultRandom(){const x=PulseVault.random(db,'neu')||PulseVault.random(db,'all');if(!x)return toast('Noch keine Videos.');vaultOpen(x.id)}
function vaultStats(){
 const s=PulseVault.stats(db),pct=s.total?Math.round(s.seen/s.total*100):0;
 const prog=s.next?Math.round((s.total-s.prev)/(s.next-s.prev)*100):100;
 return '<div class="vault-stats"><div class="vault-stat hero"><span class="life-kicker">Gesammelt</span><b class="vault-big">'+vaultFmt(s.total)+'</b><small>'+(s.first?'seit '+esc(lifeDate(s.first.slice(0,10),{day:'numeric',month:'long',year:'numeric'})):'Noch leer')+(s.playlists?' · davon '+s.playlists+(s.playlists===1?' Playlist':' Playlists'):'')+' · '+s.shelves+(s.shelves===1?' Regal':' Regale')+(s.channels?' · '+s.channels+(s.channels===1?' Kanal':' Kanäle'):'')+'</small></div>'+
  '<div class="vault-stat"><b class="vault-mid">'+vaultFmt(s.seen)+'<span class="vault-of">/'+vaultFmt(s.total)+'</span></b><small>gesehen</small><span class="vault-bar seen" aria-hidden="true"><i style="width:'+pct+'%"></i></span></div>'+
  '<div class="vault-stat"><b class="vault-mid"><span class="vault-star" aria-hidden="true">★</span> '+s.fav+'</b><small>Favoriten</small></div>'+
  '<div class="vault-stat"><b class="vault-mid">'+(s.next?vaultFmt(s.next):'✓')+'</b><small>'+(s.next?'Meilenstein · noch '+s.left:'Alle Meilensteine')+'</small><span class="vault-bar" aria-hidden="true"><i style="width:'+prog+'%"></i></span></div></div>';
}
function vaultTabs(){
 const all=PulseVault.ensure(db).items,c=PulseVault.count(all),neu=c.total-c.seen;
 return '<div class="life-seg vault-tabs" role="group" aria-label="Ansicht">'+[['list','Liste'],['shelf','Regale'],['room','Räume'],['channel','Kanäle']].map(([k,l])=>'<button type="button" aria-pressed="'+(vaultTab===k)+'" onclick="'+lifeCall('vaultSet','tab',k)+'">'+l+'</button>').join('')+'</div>'+
  '<div class="life-filterbar vault-filters">'+[['all','Alle',c.total],['neu','Merkliste',neu],['gesehen','Gesehen',c.seen],['fav','Favoriten',c.fav],...(c.playlists?[['playlist','Playlists',c.playlists]]:[])].map(([k,l,n])=>'<button type="button" aria-pressed="'+(vaultFilter===k)+'" onclick="'+lifeCall('vaultSet','filter',k)+'">'+l+' <span>'+n+'</span></button>').join('')+'</div>';
}
function vaultMosaic(items){const top=items.slice(0,4);return '<span class="vault-mosaic">'+top.map(x=>vaultImg(x,'')?'<img src="'+esc(vaultImg(x,''))+'" alt="" loading="lazy" referrerpolicy="no-referrer" onerror="this.remove()">':'<i></i>').join('')+'</span>'}
function vaultFiltered(items){return vaultFilter==='neu'||vaultFilter==='gesehen'?items.filter(x=>x.status===vaultFilter):vaultFilter==='fav'?items.filter(x=>x.fav):vaultFilter==='playlist'?items.filter(vaultIsList):items}
function vaultGroupTile(name,emoji,items,call,cls=''){
 const all=items,shown=vaultFiltered(items),c=PulseVault.count(all),pct=c.total?Math.round(c.seen/c.total*100):0;
 return '<button type="button" class="vault-shelf '+cls+'" onclick="'+call+'">'+vaultMosaic(shown.length?shown:all)+'<span class="vault-shelf-info"><b>'+(emoji?'<span class="vault-emoji" aria-hidden="true">'+esc(emoji)+'</span> ':'')+esc(name)+'</b><small>'+c.total+(c.total===1?' Video':' Videos')+' · '+c.seen+' gesehen'+(c.fav?' · ★ '+c.fav:'')+'</small><span class="vault-bar" aria-hidden="true"><i style="width:'+pct+'%"></i></span></span></button>';
}
function renderVaultResults(){
 const el=document.getElementById('vaultResults');if(!el)return;
 const items=PulseVault.ensure(db).items;
 if(!items.length){el.innerHTML=lifeEmpty('Noch keine Videos.','In der YouTube-App auf „Teilen“ tippen und Pulse wählen, oder oben einen Link einfügen. Jedes Video bekommt eine Nummer, Duplikate werden erkannt.');return}
 if(vaultTab==='shelf'&&!vaultQuery.trim()){
  const groups=PulseVault.groups(db,'shelf');
  el.innerHTML='<div class="vault-shelves">'+groups.map(g=>vaultGroupTile(g.name,g.emoji,g.items,lifeCall('vaultSet','shelf',g.key),g.key==='none'?'loose':'')).join('')+'<button type="button" class="vault-shelf new" onclick="vaultNewShelf()"><span class="vault-mosaic">'+lifeGlyph('plus')+'</span><span class="vault-shelf-info"><b>Neues Regal</b><small>z. B. Growls, Hip Thrust, Sigillen</small></span></button></div>';return}
 if(vaultTab==='room'&&!vaultQuery.trim()){
  el.innerHTML='<div class="vault-shelves">'+PulseVault.groups(db,'room').map(g=>{const r=g.key==='none'?null:PulseLife.room(g.key);return vaultGroupTile(r?r.name:'Ohne Raum','',g.items,lifeCall('vaultSet','room',g.key),r?r.color+' room':'loose')}).join('')+'</div>';return}
 if(vaultTab==='channel'&&!vaultQuery.trim()){
  const groups=PulseVault.groups(db,'channel');
  el.innerHTML='<div class="vault-channels">'+groups.map(g=>{const c=PulseVault.count(g.items);return '<button type="button" class="cos-row" onclick="'+lifeCall('vaultSet','channel',g.key)+'"><span class="cos-row-date">'+c.total+'<small>'+(c.total===1?'Video':'Videos')+'</small></span><span><b>'+esc(g.name)+'</b><small>'+c.seen+' gesehen'+(c.fav?' · ★ '+c.fav:'')+'</small></span></button>'}).join('')+(vaultThumbs()?'':'<p class="life-footnote">Kanäle werden nur erkannt, wenn Vorschaubilder und Titel in den Einstellungen an sind.</p>')+'</div>';return}
 const list=PulseVault.query(db,{filter:vaultFilter,shelf:vaultShelf,room:vaultRoom,channel:vaultChannel,q:vaultQuery,sort:vaultSort});
 const scope=vaultShelf?(vaultShelf==='none'?'Ohne Regal':vaultShelfName(vaultShelf)):vaultRoom?(vaultRoom==='none'?'Ohne Raum':PulseLife.room(vaultRoom).name):vaultChannel?vaultChannel:'';
 el.innerHTML=(scope?'<div class="vault-scope"><span>'+(vaultShelf?'Regal':vaultRoom?'Raum':'Kanal')+': <b>'+esc(scope)+'</b></span>'+(vaultShelf&&vaultShelf!=='none'?lifeButton('Bearbeiten',lifeCall('vaultEditShelf',vaultShelf),'life-textbtn'):'')+lifeButton('Alle zeigen',lifeCall('vaultSet','tab','list'),'life-textbtn')+'</div>':'')+
  '<div class="vault-listhead"><span>'+list.length+(list.length&&list.every(vaultIsList)?(list.length===1?' Playlist':' Playlists'):(list.length===1?' Eintrag':' Einträge'))+'</span><label class="vault-sort">Sortieren <select onchange="vaultSet(\'sort\',this.value)">'+[['neu','Neueste zuerst'],['alt','Älteste zuerst'],['nummer','Nach Nummer'],['titel','Titel A–Z'],['kanal','Kanal A–Z']].map(([v,l])=>'<option value="'+v+'"'+(vaultSort===v?' selected':'')+'>'+l+'</option>').join('')+'</select></label></div>'+
  (list.length?'<div class="vault-grid">'+list.slice(0,vaultLimit).map(vaultCard).join('')+'</div>'+(list.length>vaultLimit?lifeButton('Weitere '+Math.min(60,list.length-vaultLimit)+' anzeigen','vaultMore()','life-btn cal-more'):''):'<p class="life-none">Keine Videos in dieser Auswahl.</p>');
 vaultFillMissing(list.slice(0,vaultLimit));
}
function renderVault(){
 const host=document.getElementById('vaultContent');if(!host||document.getElementById('appMain').dataset.view!=='videos')return;
 vaultPrepare();
 const active=document.activeElement?.id;if(active==='vaultSearch'){renderVaultResults();return}
 host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Deine Fundstücke</span><h1>Videos</h1></header>'+vaultStats()+
  '<div class="vault-add"><label class="srOnly" for="vaultLink">YouTube-Link</label><input id="vaultLink" type="url" inputmode="url" placeholder="YouTube-Link einfügen" onkeydown="if(event.key===\'Enter\'){event.preventDefault();vaultPaste()}"/>'+(navigator.clipboard?.readText?'<button type="button" class="life-btn" onclick="vaultClipboard()">Einfügen</button>':'')+'<button type="button" class="life-btn dark" onclick="vaultPaste()">Hinzufügen</button></div>'+
  '<div class="vault-tools"><label class="life-search">'+lifeGlyph('search')+'<input id="vaultSearch" type="search" aria-label="Videos durchsuchen" placeholder="Titel, Kanal, Notiz, #Nummer …" value="'+esc(vaultQuery)+'" oninput="vaultSearch(this.value)"/></label>'+lifeButton('Zufall','vaultRandom()','life-btn')+'</div>'+
  vaultImportRow()+vaultTabs()+'<div id="vaultResults"></div>';
 renderVaultResults();vaultFillMissing();
}
/* ---------- Detail ---------- */
function vaultOpen(id){
 const x=PulseVault.get(db,id);if(!x)return;vaultOpenId=x.id;
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 el.innerHTML='<div class="pulse-video'+(x.short?' short':'')+'" id="vaultPlayer"><button type="button" class="pulse-video-play vault-player" onclick="'+lifeCall('vaultPlay',x.id,x.start||0)+'" aria-label="'+(vaultIsList(x)?'Playlist':'Video')+' abspielen">'+(vaultImg(x,'hq')?'<img src="'+esc(vaultImg(x,'hq'))+'" alt="" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><span>Abspielen</span><small>lädt von youtube-nocookie.com</small></button></div><div id="vaultMeta"></div>';
 vaultRefresh(x.id);
 if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
 vaultFetchMeta(x.id);
}
function vaultPlay(id,t){
 const x=PulseVault.get(db,id),host=document.getElementById('vaultPlayer');if(!x||!host)return;
 const f=document.createElement('iframe');f.src=PulseVideo.embed(vaultRef(x,t));f.title=x.title||(vaultIsList(x)?'YouTube-Playlist':'YouTube-Video');f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';
 host.replaceChildren(f);host.scrollIntoView({block:'nearest'});
 if(!host.dataset.counted){host.dataset.counted='1';PulseVault.watched(db,x.id,vaultNow());save();vaultRefresh(x.id);renderVault()}
}
function vaultRefresh(id){
 const x=PulseVault.get(db,id),el=document.getElementById('vaultMeta');if(!x||!el)return;
 const shelves=PulseVault.ensure(db).shelves;
 el.innerHTML='<p class="vault-meta-line"><b>'+vaultNo(x.no)+'</b>'+(vaultIsList(x)?' · Playlist':'')+' · gespeichert am '+esc(lifeDate(x.addedAt.slice(0,10),{day:'numeric',month:'long',year:'numeric'}))+(x.seen?' · '+x.seen+'× gesehen':'')+'</p>'+
  '<label class="srOnly" for="vaultTitle">Titel</label><textarea id="vaultTitle" class="vault-title" rows="1" placeholder="Titel" oninput="'+lifeCall('vaultFieldInput',x.id,'title')+'">'+esc(x.title)+'</textarea><h2 id="lifeDetailHeading" class="srOnly" tabindex="-1">'+esc(x.title||(vaultIsList(x)?'Playlist ':'Video ')+vaultNo(x.no))+'</h2>'+
  (x.channel?'<p class="vault-channel">'+esc(x.channel)+'</p>':'')+
  '<div class="vault-actions"><button type="button" class="life-btn'+(x.fav?' dark':'')+'" aria-pressed="'+x.fav+'" onclick="'+lifeCall('vaultToggle',x.id,'fav')+'">★ Favorit</button><button type="button" class="life-btn'+(x.status==='gesehen'?' dark':'')+'" aria-pressed="'+(x.status==='gesehen')+'" onclick="'+lifeCall('vaultToggle',x.id,'seen')+'">'+(x.status==='gesehen'?'Gesehen':'Als gesehen markieren')+'</button></div>'+
  '<div class="vault-block"><h3>Regale</h3><div class="vault-chips">'+shelves.map(h=>'<button type="button" aria-pressed="'+x.shelves.includes(h.id)+'" onclick="'+lifeCall('vaultShelfToggle',x.id,h.id)+'">'+esc((h.emoji?h.emoji+' ':'')+h.name)+'</button>').join('')+'</div><div class="vault-inline"><label class="srOnly" for="vaultNewShelf">Neues Regal</label><input id="vaultNewShelf" placeholder="Neues Regal, z. B. Growls" maxlength="40" onkeydown="if(event.key===\'Enter\'){event.preventDefault();vaultQuickShelf(\''+x.id+'\')}"/>'+lifeButton('Anlegen',lifeCall('vaultQuickShelf',x.id),'life-btn')+'</div></div>'+
  '<div class="vault-block"><h3>Raum</h3><select class="vault-room" aria-label="Raum" onchange="vaultRoomSet(\''+x.id+'\',this.value)"><option value="">Kein Raum</option>'+PulseLife.ROOMS.map(r=>'<option value="'+r.id+'"'+(x.room===r.id?' selected':'')+'>'+esc(r.name)+'</option>').join('')+'</select></div>'+
  (vaultIsList(x)?'':'<div class="vault-block"><h3>Stellen</h3>'+(x.marks.length?'<ul class="vault-marks">'+x.marks.map(m=>'<li><button type="button" class="vault-mark" onclick="'+lifeCall('vaultPlay',x.id,m.t)+'"><b>'+PulseVault.fmtTime(m.t)+'</b><span>'+esc(m.text||'Stelle')+'</span></button><button type="button" class="life-iconbtn" aria-label="Stelle '+PulseVault.fmtTime(m.t)+' löschen" onclick="'+lifeCall('vaultMarkRemove',x.id,m.t)+'">'+lifeGlyph('close')+'</button></li>').join('')+'</ul>':'<p class="life-footnote">Merk dir Stellen wie „1:23 Atemtechnik“. Ein Tipp spielt genau dort ab.</p>')+
  '<div class="vault-inline"><label class="srOnly" for="vaultMarkTime">Zeit</label><input id="vaultMarkTime" class="vault-time" inputmode="numeric" placeholder="1:23"/><label class="srOnly" for="vaultMarkText">Was passiert dort?</label><input id="vaultMarkText" placeholder="Was passiert dort?" maxlength="200" onkeydown="if(event.key===\'Enter\'){event.preventDefault();vaultMarkAdd(\''+x.id+'\')}"/>'+lifeButton('Merken',lifeCall('vaultMarkAdd',x.id),'life-btn')+'</div></div>')+
  '<div class="vault-block"><h3>Notiz</h3><label class="srOnly" for="vaultNote">Notiz</label><textarea id="vaultNote" rows="3" placeholder="Warum gesammelt, was ausprobieren …" oninput="'+lifeCall('vaultFieldInput',x.id,'note')+'">'+esc(x.note)+'</textarea></div>'+
  '<div class="life-detail-actions"><a class="life-btn" href="'+esc(PulseVideo.watch(vaultRef(x)))+'" target="_blank" rel="noopener noreferrer">In YouTube öffnen ↗</a>'+lifeButton('Entfernen',lifeCall('vaultRemove',x.id),'life-textbtn danger')+'</div>';
}
function vaultChange(id,fn){if(!vaultTry(fn))return;save();vaultRefresh(id);renderVault()}
/* Title and note are taken over while typing, so closing the sheet with the back button loses nothing. */
let vaultFieldTimer=null;
function vaultFieldInput(id,field){const v=document.getElementById(field==='title'?'vaultTitle':'vaultNote')?.value||'';try{PulseVault.update(db,id,{[field]:v},vaultNow())}catch(_){return}clearTimeout(vaultFieldTimer);vaultFieldTimer=setTimeout(()=>{save();renderVault()},500)}
function vaultField(id,field){const v=document.getElementById(field==='title'?'vaultTitle':'vaultNote')?.value||'';vaultChange(id,()=>PulseVault.update(db,id,{[field]:v},vaultNow()))}
function vaultToggle(id,what){const x=PulseVault.get(db,id);if(!x)return;vaultChange(id,()=>PulseVault.update(db,id,what==='fav'?{fav:!x.fav}:{status:x.status==='gesehen'?'neu':'gesehen'},vaultNow()));if(what==='fav'&&!x.fav)pulseTap();else if(what==='seen'&&x.status==='gesehen'){pulseSound('pop');pulseTap()}}
function vaultShelfToggle(id,shelf){const x=PulseVault.get(db,id);if(!x)return;vaultChange(id,()=>PulseVault.setShelf(db,id,shelf,!x.shelves.includes(shelf),vaultNow()))}
function vaultQuickShelf(id){const f=document.getElementById('vaultNewShelf'),name=f?.value.trim();if(!name)return f?.focus();vaultChange(id,()=>{const h=PulseVault.addShelf(db,name,'',vaultNow());PulseVault.setShelf(db,id,h.id,true,vaultNow())})}
function vaultRoomSet(id,room){vaultChange(id,()=>PulseVault.update(db,id,{room},vaultNow()))}
function vaultMarkAdd(id){const t=document.getElementById('vaultMarkTime')?.value,text=document.getElementById('vaultMarkText')?.value;vaultChange(id,()=>PulseVault.addMark(db,id,t,text,vaultNow()))}
function vaultMarkRemove(id,t){vaultChange(id,()=>PulseVault.removeMark(db,id,t,vaultNow()))}
function vaultRemove(id){
 const x=PulseVault.get(db,id);if(!x)return;
 pushUndo({type:'videos',before:PulseLife.clone(db.videos)});
 if(!vaultTry(()=>PulseVault.remove(db,id)))return;save();lifeCloseSheet();renderVault();toast(vaultNo(x.no)+' entfernt','Rückgängig');
}
function undoVideos(u){db.videos=u.before;PulseVault.normalize(db);save();renderVault();toast('Wiederhergestellt')}
/* ---------- Shelves ---------- */
function vaultNewShelf(){
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;vaultOpenId=null;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Neues Regal</h2><p class="life-detail-intro">Ein Regal ist deine eigene Kategorie. Ein Video kann in mehreren Regalen stehen.</p>'+vaultShelfFields('','')+'<div class="life-detail-actions">'+lifeButton('Anlegen','vaultSaveShelf()','life-btn dark')+'</div>';
 openDialog(document.getElementById('lifeSheet'),'#vaultShelfName');
}
function vaultShelfFields(name,emoji){return '<label class="life-name-field">Name<input id="vaultShelfName" maxlength="40" value="'+esc(name)+'" placeholder="z. B. Growls"/></label><label class="life-name-field">Zeichen (optional)<input id="vaultShelfEmoji" maxlength="4" value="'+esc(emoji)+'" placeholder="🎤"/></label>'}
function vaultSaveShelf(id=''){
 const name=document.getElementById('vaultShelfName')?.value||'',emoji=document.getElementById('vaultShelfEmoji')?.value||'';
 if(!vaultTry(()=>id?PulseVault.renameShelf(db,id,name,emoji):PulseVault.addShelf(db,name,emoji,vaultNow())))return;
 save();lifeCloseSheet();if(!id)vaultTab='shelf';renderVault();toast(id?'Regal gespeichert':'Regal angelegt');
}
function vaultEditShelf(id){
 const h=PulseVault.ensure(db).shelves.find(s=>s.id===id);if(!h)return;
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;vaultOpenId=null;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Regal bearbeiten</h2>'+vaultShelfFields(h.name,h.emoji)+'<div class="life-detail-actions">'+lifeButton('Speichern',lifeCall('vaultSaveShelf',id),'life-btn dark')+lifeButton('Regal löschen',lifeCall('vaultDeleteShelf',id),'life-textbtn danger')+'</div><p class="life-footnote">Beim Löschen bleiben die Videos in deiner Sammlung, nur das Regal verschwindet.</p>';
 openDialog(document.getElementById('lifeSheet'),'#vaultShelfName');
}
function vaultDeleteShelf(id){pushUndo({type:'videos',before:PulseLife.clone(db.videos)});PulseVault.removeShelf(db,id);vaultShelf='';vaultTab='shelf';save();lifeCloseSheet();renderVault();toast('Regal gelöscht','Rückgängig')}
/* ---------- Import from Google Takeout ---------- */
let vaultPending=null;
const vaultFmt=n=>Number(n).toLocaleString('de-DE');
function vaultImportRow(){
 const n=PulseVault.ensure(db).items.length,big=n<30;
 return '<div class="vault-import'+(big?' big':'')+'">'+(big?'<div><b>Deine YouTube-Listen holen</b><p>Mit dem Export aus Google Takeout kommen alle deine Playlists auf einmal herein. Jede wird ein Regal.</p></div>':'')+'<span class="vault-import-btns">'+lifeButton('So geht’s','vaultTakeoutHelp()','life-textbtn')+'<label class="life-btn'+(big?' dark':'')+'">YouTube-Listen importieren<input class="srOnly" type="file" accept=".zip,.csv,application/zip,text/csv" multiple onchange="vaultImportFiles(this.files);this.value=\'\'"/></label></span></div>';
}
function vaultTakeoutHelp(){
 libDetailShell('<span class="life-kicker">YouTube-Import</span><h2 id="lifeDetailHeading" tabindex="-1">So holst du deine Listen</h2><ol class="vault-steps"><li><b>takeout.google.com</b> öffnen, mit dem Konto deines YouTube-Kanals.</li><li>Oben <b>„Auswahl aufheben“</b>.</li><li><b>„YouTube und YouTube Music“</b> anhaken.</li><li>Auf <b>„Alle YouTube-Daten ausgewählt“</b> tippen, dort nur <b>„Playlists“</b> anhaken, OK.</li><li><b>„Nächster Schritt“</b>, einmal exportieren, Dateityp .zip, <b>„Export erstellen“</b>.</li><li>Wenn die Mail von Google kommt: ZIP herunterladen und hier auswählen. Nicht entpacken.</li></ol><p class="life-footnote">Google gibt nur die Video-Nummern heraus. Titel und Bilder holt PULSE nach und nach, wenn Vorschaubilder in den Einstellungen an sind. Ein späterer Export fügt nur Neues hinzu.</p>');
}
const vaultInflate=bytes=>new Response(new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate-raw'))).arrayBuffer().then(b=>new Uint8Array(b));
async function vaultImportFiles(files){
 if(!files||!files.length)return;
 if(typeof DecompressionStream!=='function'&&[...files].some(f=>/\.zip$/i.test(f.name)))return toast('Dieser Browser kann keine ZIP-Dateien öffnen. Entpack sie und wähl die CSV-Dateien aus dem Ordner „Playlists“.');
 try{
  const inputs=await Promise.all([...files].map(async f=>({name:f.name,bytes:new Uint8Array(await f.arrayBuffer())})));
  vaultPending=await PulseTakeout.read(inputs,{inflate:vaultInflate});vaultImportPreview();
 }catch(e){toast(e&&e.code==='TAKEOUT'?e.message:'Die Datei ließ sich nicht lesen. Ist es der YouTube-Export aus Google Takeout?')}
}
function vaultImportPreview(){
 const lists=vaultPending;if(!lists)return;const p=PulseVault.importPreview(db,lists);
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;vaultOpenId=null;
 el.innerHTML='<span class="life-kicker">YouTube-Import</span><h2 id="lifeDetailHeading" tabindex="-1">'+lists.length+(lists.length===1?' Liste':' Listen')+' gefunden</h2><p class="life-detail-intro">'+vaultFmt(p.unique)+' verschiedene Videos'+(p.already?', davon '+vaultFmt(p.already)+' schon in deiner Sammlung':'')+'. Jede Liste wird ein Regal. Neue Videos bekommen Sammlernummern, die ältesten zuerst.</p>'+
  '<div class="vault-import-lists">'+p.lists.map((l,i)=>'<label class="cal-check"><input type="checkbox" data-import="'+i+'" checked/><span><b>'+esc(l.title)+'</b><small>'+vaultFmt(l.count)+(l.count===1?' Video':' Videos')+(l.fresh!==l.count?' · '+vaultFmt(l.fresh)+' neu':'')+'</small></span></label>').join('')+'</div>'+
  '<div class="life-detail-actions">'+lifeButton('Importieren','vaultImportRun()','life-btn dark')+lifeButton('Abbrechen','vaultPending=null;lifeCloseSheet()','life-btn')+'</div><p class="life-footnote">Vorher legt PULSE einen Stand in der Zeitreise ab, und direkt danach geht „Rückgängig“.</p>';
 if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');else document.getElementById('lifeDetailHeading')?.focus();
}
async function vaultImportRun(){
 const lists=vaultPending;if(!lists)return;
 const chosen=lists.filter((_,i)=>document.querySelector('[data-import="'+i+'"]')?.checked);if(!chosen.length)return toast('Keine Liste ausgewählt.');
 vaultPending=null;try{await backupSnapshot('vor-import')}catch(_){}
 const s=PulseVault.ensure(db),before=s.items.length,next=s.next,r=PulseVault.importLists(db,chosen,vaultNow());
 pushUndo({type:'videos-import',items:r.ids.items,shelves:r.ids.shelves,links:r.ids.links,next});
 if(!save())return;
 lifeCloseSheet();vaultTab='shelf';vaultShelf='';vaultRoom='';vaultChannel='';renderVault();
 const m=PulseVault.reached(before,r.total);pulseSound(m?'chime':'pop');pulseTap([12,60,18]);
 toast(vaultFmt(r.added)+(r.added===1?' Video':' Videos')+' aus '+chosen.length+(chosen.length===1?' Liste':' Listen')+(r.linked?' · '+vaultFmt(r.linked)+' einsortiert':''),'Rückgängig');
}
function undoVideoImport(u){PulseVault.undoImport(db,u);save();renderVault();toast('Import rückgängig gemacht')}
function lifeSetVideoMeta(){db.uiPrefs.videoMeta=db.uiPrefs.videoMeta===false;if(save()){lifeSettings();renderVault()}}
function videoSettingsHTML(){return '<div class="life-settings-row"><div><b>Vorschaubilder und Titel von YouTube</b><p>Lädt Bild, Titel und Kanal von YouTube. Klappt das direkt nicht, fragt Pulse den offenen Dienst noembed.com. Wenn aus, geht nichts nach außen, bis du ein Video abspielst.</p></div>'+lifeButton(db.uiPrefs.videoMeta===false?'Aus':'An','lifeSetVideoMeta()','life-btn')+'</div>'}
