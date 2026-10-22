// SOURCE: ui/stapel.js
/* "Stapel": the day's stack of cards. Read, watch, keep, do something – and then it is done for the day.
   Sources: written cards (PulseCards), the person's own videos, tarot study, an old note, today's sky. */
let stapelSettingsOpen=false,stapelTouch=null;
function lifeOpenStapel(){goView('stapel')}
/* Saves without re-rendering, so a running video keeps playing. Problems still show the normal warning. */
function stapelQuiet(){try{storage.save(db);PulseStorageUI.clear();return true}catch(_){return save()}}
function stapelSources(){
 if(typeof vaultPrepare==='function')vaultPrepare();
 const own=PulseLife.list(db).filter(x=>x.kind==='note'&&x.status!=='archived'&&typeof x.createdAt==='string'&&(x.title||'').trim());
 return {cards:PulseCards.ALL,videos:PulseVault.ensure(db).items,own,tarot:PulseLibrary.TAROT.length};
}
/* Today's stack; marks the open card as shown. Returns true when something changed that must be saved. */
function stapelPrepare(){
 const d=PulseDeck.ensure(db),before=JSON.stringify([d.day,d.cards.length,d.reached,d.pos,d.cards[d.pos]&&d.seen[d.cards[d.pos].ref]]);
 if(d.day!==key()||!d.cards.length)PulseDeck.today(db,key(),stapelSources());if(d.pos<d.cards.length)PulseDeck.go(db,d.pos);
 return JSON.stringify([d.day,d.cards.length,d.reached,d.pos,d.cards[d.pos]&&d.seen[d.cards[d.pos].ref]])!==before;
}
function stapelAge(iso){
 const n=Math.max(0,Math.round((Date.parse(key()+'T12:00:00')-Date.parse(String(iso).slice(0,10)+'T12:00:00'))/864e5));
 if(n<1)return 'seit heute';if(n<45)return 'seit '+n+(n===1?' Tag':' Tagen');const m=Math.round(n/30.4);if(m<12)return 'seit '+m+(m===1?' Monat':' Monaten');const y=Math.floor(n/365.25);return y===1?'seit einem Jahr':'seit '+y+' Jahren';
}
/* ---------- Pictures: every written card gets its own generated image ---------- */
function stapelArt(c){
 const r=PulseDeck.rng(c.id),R=(a,b)=>a+r()*(b-a),f=n=>Math.round(n*10)/10;let g='';
 if(c.topic==='geist'){const pts=Array.from({length:16},()=>[R(20,340),R(18,182)]);for(let i=0;i<pts.length;i++)for(let j=i+1;j<pts.length;j++){const d=Math.hypot(pts[i][0]-pts[j][0],pts[i][1]-pts[j][1]);if(d<95)g+='<line x1="'+f(pts[i][0])+'" y1="'+f(pts[i][1])+'" x2="'+f(pts[j][0])+'" y2="'+f(pts[j][1])+'" stroke-opacity="'+f(.5-d/240)+'"/>'}g+=pts.map(p=>'<circle cx="'+f(p[0])+'" cy="'+f(p[1])+'" r="'+f(R(2,4.5))+'" fill="#fff" stroke="none"/>').join('')}
 else if(c.topic==='kosmos'){for(let i=0;i<90;i++)g+='<circle cx="'+f(R(0,360))+'" cy="'+f(R(0,200))+'" r="'+f(R(.4,1.4))+'" fill="#fff" stroke="none" fill-opacity="'+f(R(.25,1))+'"/>';const x=R(220,320),y=R(40,90);g+='<ellipse cx="'+f(x-60)+'" cy="'+f(y+60)+'" rx="'+f(R(90,140))+'" ry="'+f(R(20,40))+'" stroke-opacity=".3" transform="rotate('+f(R(-25,-5))+' '+f(x-60)+' '+f(y+60)+')"/><circle cx="'+f(x)+'" cy="'+f(y)+'" r="3" fill="#fff" stroke="none"/><path d="M'+f(x-12)+' '+f(y)+'h24M'+f(x)+' '+f(y-12)+'v24" stroke-opacity=".7"/>'}
 else if(c.topic==='magie'){const s=typeof PulseSigil!=='undefined'?PulseSigil.draw(PulseSigil.reduce(c.title),{method:'rad',style:'geschwungen',seed:PulseDeck.hash(c.id)%997+1}):null;g+='<circle cx="180" cy="100" r="86" stroke-opacity=".35"/><circle cx="180" cy="100" r="92" stroke-opacity=".15"/>'+(s&&s.d?'<g transform="translate(95 15) scale(.85)" stroke-width="5"><path d="'+s.d+'"/><circle cx="'+s.start.x+'" cy="'+s.start.y+'" r="7"/><line x1="'+s.end.x1+'" y1="'+s.end.y1+'" x2="'+s.end.x2+'" y2="'+s.end.y2+'"/></g>':'')}
 else if(c.topic==='stimme'){for(let k=0;k<4;k++){const a=[R(8,26),R(4,14),R(2,8)],w=[R(.02,.05),R(.06,.11),R(.13,.2)],p=[R(0,6),R(0,6),R(0,6)],y0=100+(k-1.5)*14;let d='';for(let x=0;x<=360;x+=6){const y=y0+a.reduce((s,ai,i)=>s+ai*Math.sin(x*w[i]+p[i]),0)*(.4+.6*Math.sin(Math.PI*x/360));d+=(x?'L':'M')+x+' '+f(y)}g+='<path d="'+d+'" stroke-opacity="'+f(.85-k*.18)+'" stroke-width="'+(k?2:3)+'"/>'}}
 else if(c.topic==='kunst'){const col=['#FDE68A','#FCA5A5','#FFFFFF','#FDBA74','#FEF3C7'];for(let i=0;i<6;i++){const x=R(30,330),y=R(20,180),s=R(28,80),fill=col[Math.floor(r()*col.length)],o=f(R(.25,.6)),t=Math.floor(r()*3);g+=t===0?'<circle cx="'+f(x)+'" cy="'+f(y)+'" r="'+f(s/2)+'" fill="'+fill+'" fill-opacity="'+o+'" stroke="none"/>':t===1?'<rect x="'+f(x-s/2)+'" y="'+f(y-s/2)+'" width="'+f(s)+'" height="'+f(s*R(.5,1.2))+'" fill="'+fill+'" fill-opacity="'+o+'" stroke="none" transform="rotate('+f(R(-30,30))+' '+f(x)+' '+f(y)+')"/>':'<path d="M'+f(x)+' '+f(y-s/2)+'L'+f(x+s/2)+' '+f(y+s/2)+'H'+f(x-s/2)+'Z" fill="'+fill+'" fill-opacity="'+o+'" stroke="none"/>'}g+='<path d="M'+f(R(10,80))+' '+f(R(140,190))+'C'+f(R(100,160))+' '+f(R(20,80))+' '+f(R(200,260))+' '+f(R(120,190))+' '+f(R(290,350))+' '+f(R(20,90))+'" stroke-width="3" stroke-opacity=".8"/>'}
 else{for(let i=0;i<5;i++){const y=26+i*20,w=R(120,280);g+='<path d="M30 '+y+'H'+f(30+w)+'" stroke-width="5" stroke-opacity="'+f(.3+r()*.35)+'"/>'}g+='<circle cx="'+f(R(270,330))+'" cy="'+f(R(30,70))+'" r="'+f(R(8,15))+'" fill="#fff" fill-opacity=".8" stroke="none"/>'}
 return '<svg class="stapel-art" viewBox="0 0 360 200" preserveAspectRatio="xMidYMid slice" aria-hidden="true"><g fill="none" stroke="#fff" stroke-width="1.5" stroke-linecap="round">'+g+'</g></svg>';
}
/* ---------- Cards ---------- */
const STAPEL_ACT={timer:c=>'Timer: '+c.min+' Min.',write:()=>'Aufschreiben',sigil:()=>'Sigillen-Werkstatt',tarot:()=>'Karten legen',cutup:()=>'Cut-up öffnen',warmup:()=>'Einsingen starten',song:()=>'Song-Werkstatt',sky:()=>'Mond & Kalender'};
function stapelParas(t){return String(t||'').split('\n\n').map(p=>'<p>'+esc(p)+'</p>').join('')}
function stapelKeepBtn(ref){const on=PulseDeck.isKept(db,ref);return '<button type="button" class="life-btn stapel-keep" aria-pressed="'+on+'" onclick="'+lifeCall('stapelKeep',ref)+'">'+(on?'★ Behalten':'☆ Behalten')+'</button>'}
function stapelCardHTML(card,{inSheet=false}={}){
 const ref=card.ref,type=card.type;
 if(type==='card'){
  const c=PulseCards.get(ref.slice(2));if(!c)return stapelMissing('Diese Karte gibt es nicht mehr.');
  const T=PulseCards.TOPICS[c.topic];
  return '<article class="stapel-card t-'+c.topic+'"><div class="stapel-cover">'+stapelArt(c)+'<span class="stapel-kicker">'+esc(PulseCards.KINDS[c.kind])+' · '+esc(T.name)+'</span><h2 id="'+(inSheet?'lifeDetailHeading':'stapelTitle')+'" tabindex="-1">'+esc(c.title)+'</h2></div><div class="stapel-body">'+stapelParas(c.text)+
   (c.try?'<div class="stapel-try"><b>Probier das</b><p>'+esc(c.try)+'</p></div>':'')+(c.ask?'<div class="stapel-ask"><b>Zum Mitnehmen</b><p>'+esc(c.ask)+'</p></div>':'')+(c.read?'<p class="stapel-read">Weiter: '+esc(c.read)+'</p>':'')+
   '<div class="stapel-actions">'+stapelKeepBtn(ref)+(c.act&&STAPEL_ACT[c.act]?lifeButton(STAPEL_ACT[c.act](c),lifeCall('stapelAct',c.id),'life-btn dark'):'')+'</div></div></article>';
 }
 if(type==='tarot'){
  const i=Number(ref.slice(2)),t=PulseLibrary.TAROT[i];if(!t)return stapelMissing('Diese Karte gibt es nicht.');
  const studied=Object.keys(PulseDeck.ensure(db).seen).filter(k=>k.startsWith('t:')).length,note=(tarotPrefs().tarotNotes||{})[i]||'';
  return '<article class="stapel-card t-tarot"><div class="stapel-cover"><div class="stapel-tarot-face"><span>'+(t.arcana==='major'?toRoman(t.number):esc(t.element))+'</span>'+lifeGlyph('star')+'</div><span class="stapel-kicker">Tarot lernen · '+Math.min(studied,78)+' von 78 angeschaut</span><h2 id="'+(inSheet?'lifeDetailHeading':'stapelTitle')+'" tabindex="-1">'+esc(t.name)+'</h2>'+(t.wildUnknown?'<small class="stapel-sub">In The Wild Unknown: '+esc(t.wildUnknown)+'</small>':'')+'</div><div class="stapel-body">'+
   '<div class="stapel-facts"><b>Bedeutung</b><p>'+esc(t.keywords)+'</p><b>Umgekehrt</b><p>'+esc(t.reversed)+'</p></div><div class="stapel-ask"><b>Eine Frage dazu</b><p>'+esc(t.question)+'</p></div>'+
   (note?'<div class="stapel-try"><b>Deine Bedeutung</b><p>'+esc(note)+'</p></div>':'<p class="stapel-read">Such die Karte in deinen Decks und schau sie dir an, bevor du weiterliest.</p>')+
   '<div class="stapel-actions">'+stapelKeepBtn(ref)+lifeButton(note?'Meine Bedeutung ändern':'Meine Bedeutung schreiben',lifeCall('lifeTarotOpen',i),'life-btn dark')+'</div></div></article>';
 }
 if(type==='video'){
  const vid=ref.slice(2),x=PulseVault.get(db,'yt-'+vid);if(!x)return stapelMissing('Dieses Video ist nicht mehr in deiner Sammlung.');
  const shelves=x.shelves.map(vaultShelfName).filter(Boolean).join(' · ');
  return '<article class="stapel-card t-video" data-video="'+esc(x.id)+'"><div class="pulse-video stapel-player'+(x.short?' short':'')+'" id="stapelPlayer"><button type="button" class="pulse-video-play vault-player" onclick="'+lifeCall('stapelPlay',x.id)+'" aria-label="Video abspielen">'+(vaultImg(x,'hq')?'<img src="'+esc(vaultImg(x,'hq'))+'" alt="" referrerpolicy="no-referrer" onerror="this.remove()">':'')+'<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><span>Abspielen</span><small>lädt von youtube-nocookie.com</small></button></div>'+
   '<div class="stapel-body"><span class="stapel-kicker">Aus deiner Sammlung · '+vaultNo(x.no)+(shelves?' · '+esc(shelves):'')+'</span><h2 id="stapelTitle" tabindex="-1" data-meta-title="'+esc(x.id)+'">'+esc(x.title||'Video '+vaultNo(x.no))+'</h2><p class="stapel-meta" data-meta-line="'+esc(x.id)+'">'+esc([x.channel,stapelAge(x.addedAt)+' auf deiner Liste',x.status==='gesehen'?'gesehen':''].filter(Boolean).join(' · '))+'</p>'+
   '<div class="stapel-actions"><button type="button" class="life-btn" aria-pressed="'+x.fav+'" onclick="'+lifeCall('stapelVideo',x.id,'fav')+'">'+(x.fav?'★ Favorit':'☆ Favorit')+'</button><button type="button" class="life-btn" aria-pressed="'+(x.status==='gesehen')+'" onclick="'+lifeCall('stapelVideo',x.id,'seen')+'">'+(x.status==='gesehen'?'✓ Gesehen':'Schon gesehen')+'</button>'+lifeButton('Notiz & Stellen',lifeCall('vaultOpen',x.id),'life-textbtn')+'</div></div></article>';
 }
 if(type==='own'){
  const x=PulseLife.get(db,ref.slice(2));if(!x)return stapelMissing('Diese Notiz gibt es nicht mehr.');
  const room=PulseLife.room(x.room);
  return '<article class="stapel-card t-own"><div class="stapel-cover">'+lifeGlyph(room.symbol,'stapel-own-glyph')+'<span class="stapel-kicker">Von dir · '+esc(stapelAge(x.createdAt).replace('seit ','vor '))+' · '+esc(room.name)+'</span><h2 id="stapelTitle" tabindex="-1">'+esc(x.title)+'</h2></div><div class="stapel-body">'+(x.body?stapelParas(x.body.slice(0,700)+(x.body.length>700?' …':'')):'<p class="stapel-read">Nur ein Titel. Was meintest du damals?</p>')+
   '<div class="stapel-actions">'+lifeButton('Weiterdenken',lifeCall('stapelFollow',x.id),'life-btn dark')+lifeButton('Öffnen',lifeCall('lifeOpenItem',x.id),'life-btn')+'</div></div></article>';
 }
 if(type==='sky')return stapelSky();
 return stapelMissing('Unbekannte Karte.');
}
function stapelMissing(text){return '<article class="stapel-card t-own"><div class="stapel-body"><h2 id="stapelTitle" tabindex="-1">Weg</h2><p>'+esc(text)+'</p></div></article>'}
function stapelSky(){
 const date=key(),m=cosmosMoon(date),noon=cosmosNoon(date),sign=PulseAstro.moonSign(noon),planet=PulseAstro.dayRuler(date),PL=PulseLore.PLANETS[planet],P=PulseLore.PHASES[m.index],fests=cosmosFests(date),sun=PulseAstro.sunTimes(date);
 return '<article class="stapel-card t-sky"><div class="stapel-cover">'+moonSvg(m,112)+'<span class="stapel-kicker">Himmel heute · '+m.illumination+' % beleuchtet</span><h2 id="stapelTitle" tabindex="-1">'+esc(m.name)+'</h2><small class="stapel-sub">Mond in '+sign.glyph+' '+esc(sign.name)+'</small></div><div class="stapel-body">'+
  '<p>'+esc(PulseLore.SIGN_TEXT[sign.name]||'')+'</p>'+(fests.length?'<div class="stapel-try"><b>Heute</b><p>'+esc(fests.map(f=>f.name).join(' · '))+'</p></div>':'')+
  '<div class="stapel-facts"><b>Planetentag</b><p>'+PulseAstro.PLANET_GLYPH[planet]+' '+esc(planet)+' · '+esc(PL.themes)+'</p>'+(sun?'<b>Sonne</b><p>Aufgang '+cosmosTime(sun.rise)+' · Untergang '+cosmosTime(sun.set)+'</p>':'')+'</div>'+
  '<div class="stapel-ask"><b>'+esc(P.title)+'</b><p>'+esc(P.text)+'</p></div><div class="stapel-actions">'+lifeButton('Almanach öffnen',lifeCall('lifeOpenCalendar',date),'life-btn dark')+'</div></div></article>';
}
function stapelEnd(){
 const d=PulseDeck.ensure(db),s=PulseDeck.summary(db),watched=d.stats.watched||0,kept=d.stats.kept||0;
 return '<article class="stapel-card t-end"><div class="stapel-cover"><svg class="stapel-done" viewBox="0 0 120 90" aria-hidden="true"><rect x="22" y="16" width="56" height="70" rx="8" transform="rotate(-10 50 50)"/><rect x="34" y="10" width="56" height="70" rx="8" transform="rotate(4 62 45)"/><path d="m50 46 9 9 18-20"/></svg><span class="stapel-kicker">Für heute</span><h2 id="stapelTitle" tabindex="-1">Stapel durch</h2></div><div class="stapel-body">'+
  '<p class="stapel-summary">'+d.cards.length+' Karten'+(kept?' · '+kept+' behalten':'')+(watched?' · '+watched+(watched===1?' Video':' Videos')+' gesehen':'')+'</p><p>Morgen liegt ein neuer Stapel bereit. Bis dahin ist hier Schluss, mit Absicht.</p>'+
  (s.days>1?'<p class="stapel-read">'+s.days+' Stapel-Tage bisher · '+s.kept+' Karten in deiner Sammlung</p>':'')+
  '<div class="stapel-actions">'+(PulseDeck.ensure(db).kept.length?lifeButton('Deine Sammlung ('+PulseDeck.ensure(db).kept.length+')','stapelKept()','life-btn'):'')+lifeButton('Zurück zum Tag',lifeCall('goView','life'),'life-btn dark')+'</div></div></article>';
}
function renderStapel(){
 const host=document.getElementById('stapelContent');if(!host||document.getElementById('appMain').dataset.view!=='stapel')return;
 if(stapelPrepare())setTimeout(save,0);
 const d=PulseDeck.ensure(db),n=d.cards.length,pos=d.pos,end=pos>=n,card=d.cards[pos];
 host.innerHTML='<div class="stapel"><div class="stapel-progress" aria-hidden="true">'+d.cards.map((c,i)=>'<i class="'+(i<pos?'done':i===pos?'now':'')+'"></i>').join('')+'</div>'+
  '<div class="stapel-head"><span class="stapel-count">'+(end?'Fertig':'Karte '+(pos+1)+' von '+n)+'</span><span class="stapel-headbtns">'+(d.kept.length?'<button type="button" class="life-textbtn" onclick="stapelKept()">★ '+d.kept.length+'</button>':'')+'<button type="button" class="life-iconbtn" aria-label="Stapel einstellen" onclick="stapelSettings()">'+lifeGlyph('settings')+'</button></span></div>'+
  '<div class="stapel-stage" id="stapelStage">'+(end?stapelEnd():stapelCardHTML(card))+'</div>'+
  (end?'':'<div class="stapel-nav">'+lifeButton('‹ Zurück',lifeCall('stapelGo',pos-1),'life-btn'+(pos?'':' is-hidden'))+lifeButton(pos===n-1?'Fertig ✓':'Weiter ›',lifeCall('stapelGo',pos+1),'life-btn dark')+'</div>')+'</div>';
 if(card&&card.type==='video'&&!end){const x=PulseVault.get(db,'yt-'+card.ref.slice(2));if(x&&!x.title&&typeof vaultFetchMeta==='function')vaultFetchMeta(x.id)}
 stapelPrefetch();
}
/* Titles for today's videos come in the background, so they are there when the card opens. */
function stapelPrefetch(){if(typeof vaultFetchMeta!=='function')return;for(const c of PulseDeck.ensure(db).cards)if(c.type==='video'){const x=PulseVault.get(db,'yt-'+c.ref.slice(2));if(x&&!x.title)vaultFetchMeta(x.id)}}
/* Called when a title arrived: update the open card without reloading a running video. */
function stapelMetaArrived(id){
 const x=PulseVault.get(db,id);if(!x)return;
 document.querySelectorAll('[data-meta-title="'+id+'"]').forEach(e=>e.textContent=x.title||'Video '+vaultNo(x.no));
 document.querySelectorAll('[data-meta-line="'+id+'"]').forEach(e=>e.textContent=[x.channel,stapelAge(x.addedAt)+' auf deiner Liste',x.status==='gesehen'?'gesehen':''].filter(Boolean).join(' · '));
}
function stapelGo(i){
 const d=PulseDeck.ensure(db),to=Math.max(0,Math.min(d.cards.length,i));if(to===d.pos)return;
 PulseDeck.go(db,to);if(to>=d.cards.length){pulseSound('chime');pulseTap([10,50,10])}else pulseTap(6);
 save();window.scrollTo(0,0);setTimeout(()=>document.getElementById('stapelTitle')?.focus({preventScroll:true}),60);
}
function stapelKeep(ref){
 let k;try{k=PulseDeck.keep(db,ref,new Date().toISOString())}catch(e){return toast(e.message)}
 if(k){pulseSound('pop');pulseTap();toast('Behalten · Nummer '+k.no)}else toast('Aus der Sammlung genommen');
 save();if(document.getElementById('lifeSheet')?.open&&document.getElementById('stapelKeptList'))stapelKept();
}
function stapelAct(id){
 const c=PulseCards.get(id);if(!c)return;
 if(c.act==='timer'){if(lifeState().focus){goView('focus');return toast('Es läuft bereits ein Timer.')}try{PulseLife.startFocus(db,{id:'',title:c.title,resume:c.try||c.ask||''},c.min||5,Date.now())}catch(e){return toast(e.message)}if(save())goView('focus');return}
 if(c.act==='write')return lifeCompose({kind:'note',room:PulseCards.TOPICS[c.topic].room,title:c.title,body:(c.ask||c.try||'')+'\n\n',source:'stapel:'+c.id});
 if(c.act==='sigil')return lifeOpenSigils();
 if(c.act==='tarot')return lifeSpread(c.spread||'drei');
 if(c.act==='cutup')return lifeCutup('');
 if(c.act==='warmup')return songWarmStart(false);
 if(c.act==='song')return lifeOpenSongs();
 if(c.act==='sky')return lifeOpenCalendar(key());
}
function stapelFollow(id){const x=PulseLife.get(db,id);if(x)lifeCompose({kind:'note',room:x.room,title:x.title+' – weitergedacht',body:'',source:x.id})}
function stapelPlay(id){
 const x=PulseVault.get(db,id),host=document.getElementById('stapelPlayer');if(!x||!host)return;
 const f=document.createElement('iframe');f.src=PulseVideo.embed(vaultRef(x,x.start||0));f.title=x.title||'YouTube-Video';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';
 host.replaceChildren(f);
 if(!host.dataset.counted){host.dataset.counted='1';PulseVault.watched(db,x.id,new Date().toISOString());PulseDeck.watched(db);stapelQuiet();stapelMetaArrived(x.id)}
}
function stapelVideo(id,what){
 const x=PulseVault.get(db,id);if(!x)return;
 PulseVault.update(db,id,what==='fav'?{fav:!x.fav}:{status:x.status==='gesehen'?'neu':'gesehen'},new Date().toISOString());
 if(what==='seen'&&x.status==='gesehen')PulseDeck.watched(db);
 pulseTap();
 // Saving without a full render keeps a playing video running; only the buttons change.
 if(!stapelQuiet())return;
 const card=document.querySelector('.stapel-card[data-video="'+id+'"] .stapel-actions');
 if(card){const btns=card.querySelectorAll('button');btns[0].setAttribute('aria-pressed',String(x.fav));btns[0].textContent=x.fav?'★ Favorit':'☆ Favorit';btns[1].setAttribute('aria-pressed',String(x.status==='gesehen'));btns[1].textContent=x.status==='gesehen'?'✓ Gesehen':'Schon gesehen'}
 stapelMetaArrived(id);
}
/* ---------- Kept cards ---------- */
function stapelKeptTitle(ref){if(ref.startsWith('c:'))return PulseCards.get(ref.slice(2))?.title||'Karte';if(ref.startsWith('t:'))return PulseLibrary.TAROT[Number(ref.slice(2))]?.name||'Tarotkarte';return 'Karte'}
function stapelKeptKicker(ref){if(ref.startsWith('t:'))return 'Tarot';const c=PulseCards.get(ref.slice(2));return c?PulseCards.TOPICS[c.topic].name:''}
function stapelKept(){
 const kept=[...PulseDeck.ensure(db).kept].reverse();
 libDetailShell('<span class="life-kicker">Deine Sammlung</span><h2 id="lifeDetailHeading" tabindex="-1">Behaltene Karten</h2><div id="stapelKeptList">'+(kept.length?kept.map(k=>'<button type="button" class="cos-row" onclick="'+lifeCall('stapelShowKept',k.ref)+'"><span class="cos-row-date">#'+String(k.no).padStart(3,'0')+'</span><span><b>'+esc(stapelKeptTitle(k.ref))+'</b><small>'+esc(stapelKeptKicker(k.ref))+' · '+esc(lifeDate(String(k.at).slice(0,10),{day:'numeric',month:'short',year:'numeric'}))+'</small></span></button>').join(''):'<p class="life-none">Noch keine Karte behalten. Im Stapel auf „☆ Behalten“ tippen.</p>')+'</div>');
}
function stapelShowKept(ref){libDetailShell('<div class="stapel-sheetcard">'+stapelCardHTML({type:ref.startsWith('t:')?'tarot':'card',ref},{inSheet:true})+'</div>'+lifeButton('← Sammlung','stapelKept()','life-textbtn'))}
/* ---------- Settings ---------- */
function stapelSettings(){
 const d=PulseDeck.ensure(db);
 libDetailShell('<span class="life-kicker">Stapel</span><h2 id="lifeDetailHeading" tabindex="-1">Dein Stapel</h2><p class="life-detail-intro">Jeden Tag eine feste Zahl Karten: Gedanken, Übungen, Videos aus deiner Sammlung, eine Tarotkarte zum Lernen, der Himmel und ab und zu eine alte Notiz von dir. Wenn er durch ist, ist Schluss bis morgen.</p>'+
  '<div class="life-sectionhead"><h3>Karten pro Tag</h3></div><div class="life-seg" role="group" aria-label="Karten pro Tag">'+PulseDeck.SIZES.map(n=>'<button type="button" aria-pressed="'+(d.size===n)+'" onclick="'+lifeCall('stapelConfigure','size',n)+'">'+n+'</button>').join('')+'</div>'+
  '<div class="life-sectionhead"><h3>Themen</h3></div><div class="vault-chips">'+PulseDeck.TOPICS.map(t=>'<button type="button" aria-pressed="'+d.topics.includes(t)+'" onclick="'+lifeCall('stapelConfigure','topic',t)+'">'+esc(PulseCards.TOPICS[t].name)+'</button>').join('')+'</div>'+
  '<p class="life-footnote">'+PulseCards.ALL.length+' Karten gibt es bisher. Gesehene kommen erst wieder, wenn alle anderen dran waren. Videos aus deiner Sammlung kommen frühestens nach 45 Tagen wieder.</p>');
}
function stapelConfigure(what,v){
 const d=PulseDeck.ensure(db);let fresh;
 try{fresh=what==='size'?PulseDeck.configure(db,{size:v}):PulseDeck.configure(db,{topics:d.topics.includes(v)?d.topics.filter(t=>t!==v):[...d.topics,v]})}catch(e){return toast(e.message)}
 save();stapelSettings();toast(fresh?'Gilt ab jetzt':'Gilt ab dem nächsten Stapel');
}
/* ---------- Tag tile ---------- */
function tileStapel(){
 const d=PulseDeck.ensure(db),today=d.day===key()&&d.cards.length,n=today?d.cards.length:d.size,done=today&&d.pos>=d.cards.length,at=today?Math.min(d.pos,n):0;
 return '<button type="button" class="pulse-tile tile-stapel" onclick="lifeOpenStapel()"><span class="pulse-tile-head">Dein Stapel</span><b class="pulse-tile-value">'+(done?'Für heute durch':at?'Weiter bei Karte '+(at+1):'Neu · '+n+' Karten')+'</b><span class="tile-stapel-bar" aria-hidden="true">'+Array.from({length:n},(_,i)=>'<i class="'+(i<at||done?'on':'')+'"></i>').join('')+'</span><small>'+(done?'Morgen gibt es einen neuen':'Statt Scrollen: lesen, schauen, behalten')+'</small></button>';
}
/* Swipe left/right on the card; arrow keys on a keyboard. */
document.addEventListener('pointerdown',e=>{if(!e.target.closest?.('#stapelStage')||e.target.closest('button,a,iframe,textarea,input'))return stapelTouch=null;stapelTouch={x:e.clientX,y:e.clientY,t:Date.now()}});
document.addEventListener('pointerup',e=>{const s=stapelTouch;stapelTouch=null;if(!s||document.getElementById('appMain')?.dataset.view!=='stapel')return;const dx=e.clientX-s.x,dy=e.clientY-s.y;if(Math.abs(dx)>70&&Math.abs(dx)>Math.abs(dy)*1.6&&Date.now()-s.t<800){const d=PulseDeck.ensure(db);stapelGo(d.pos+(dx<0?1:-1))}});
document.addEventListener('keydown',e=>{if(document.getElementById('appMain')?.dataset.view!=='stapel'||e.target.closest?.('input,textarea,select,[contenteditable]')||document.getElementById('lifeSheet')?.open)return;const d=PulseDeck.ensure(db);if(e.key==='ArrowRight')stapelGo(d.pos+1);else if(e.key==='ArrowLeft')stapelGo(d.pos-1)});
