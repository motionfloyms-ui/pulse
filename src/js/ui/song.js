// SOURCE: ui/song.js
/* Song-Werkstatt: songs, the line-by-line vocal map, stage mode, takes, references, warm-up. */
let songOpenId=null,songTab='karte',songSel=null,songReady=false,songSaveTimer=null,songStage=null,songWarm=null,songRefQuery='';
const songNow=()=>new Date().toISOString();
const DYN_COLOR={leise:'#7FB3E6',normal:'#9AA3B5',voll:'#F1B92B',belt:'#FF8A3D',scream:'#E0484F',growl:'#9B2C5A'};
function lifeOpenSongs(id=null){songOpenId=id;songSel=null;goView('songs');renderSongs()}
function songPrepare(){if(songReady||!db)return;songReady=true;PulseSong.normalize(db)}
function songSave(){if(!save())return false;renderSongs();return true}
function songTry(fn){try{fn();return true}catch(e){toast(e.message);return false}}
const songLabel=(list,id)=>(list.find(x=>x[0]===id)||[])[1]||'';
function songCard(s){
 const c=PulseSong.coverage(s),last=s.takes.at(-1);
 return '<button type="button" class="song-card" onclick="'+lifeCall('lifeOpenSongs',s.id)+'"><span class="song-no">#'+s.no+'</span><span class="song-card-main"><b>'+esc(s.title)+'</b><small>'+esc(songLabel(PulseSong.STATUS,s.status))+(c.lines?' · '+c.done+'/'+c.lines+' Zeilen markiert':'')+(s.takes.length?' · '+s.takes.length+(s.takes.length===1?' Take':' Takes'):'')+(last?' · zuletzt '+esc(lifeDate(last.at.slice(0,10),{day:'numeric',month:'short'})):'')+'</small></span><span class="song-progress" aria-hidden="true"><i style="width:'+(c.lines?Math.round(c.done/c.lines*100):0)+'%"></i></span></button>';
}
function renderSongs(){
 const host=document.getElementById('songContent');if(!host||document.getElementById('appMain').dataset.view!=='songs')return;
 if(['songLyrics','songNoteInput','songTakeNote','songRefSearch'].includes(document.activeElement?.id))return;
 songPrepare();const all=PulseSong.ensure(db).items;
 const s=songOpenId&&PulseSong.get(db,songOpenId);
 if(!s){songOpenId=null;
  host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Ideen &amp; Lernen</span><h1>Song-Werkstatt</h1></header>'+
   '<div class="life-detail-actions song-top">'+lifeButton(lifeGlyph('plus')+'Neuer Song','songNew()','life-btn dark')+lifeButton('Einsingen','songWarmStart()','life-btn')+'</div>'+
   (all.length?'<div class="song-list">'+[...all].sort((a,b)=>b.updatedAt.localeCompare(a.updatedAt)).map(songCard).join('')+'</div>':lifeEmpty('Noch kein Song.','Leg einen Song an und füge den Text ein. Dann entscheidest du Zeile für Zeile, wie du sie singst: Dynamik, Klangfarbe, Atem, Betonung.'))+
   '<div class="cos-actions">'+lifeButton('Gesangskarte',lifeCall('lifeOpenLib','ideen-gesangskarte-fu-r-einen-song'),'life-textbtn')+lifeButton('Extreme Vocals sicher üben',lifeCall('lifeOpenLib','ideen-extreme-vocals-sicher-u-ben'),'life-textbtn')+'</div>';
  return;
 }
 const tabs=[['text','Text'],['karte','Gesangskarte'],['takes','Takes'+(s.takes.length?' '+s.takes.length:'')],['refs','Referenzen'+(s.refs.length?' '+s.refs.length:'')]];
 host.innerHTML='<div class="song-back">'+lifeButton('‹ Alle Songs','lifeOpenSongs()','life-textbtn')+'</div><header class="life-pagehead"><span class="life-kicker">Song #'+s.no+(s.key||s.bpm?' · '+esc([s.key,s.bpm?s.bpm+' BPM':''].filter(Boolean).join(' · ')):'')+'</span><h1>'+esc(s.title)+'</h1></header>'+
  '<div class="vault-chips song-status" role="group" aria-label="Status">'+PulseSong.STATUS.map(([k,l])=>'<button type="button" aria-pressed="'+(s.status===k)+'" onclick="'+lifeCall('songSet',s.id,'status',k)+'">'+l+'</button>').join('')+'</div>'+
  '<div class="song-actions">'+lifeButton('Bühnenmodus',lifeCall('songStageOpen',s.id),'life-btn dark')+lifeButton('Einsingen','songWarmStart()','life-btn')+lifeButton(PulseMetronome.running()?'Metronom aus':'Metronom'+(s.bpm?' '+s.bpm:''),lifeCall('songMetro',s.id),'life-btn')+'</div>'+
  '<div class="vault-tabs life-seg" role="group" aria-label="Bereich">'+tabs.map(([k,l])=>'<button type="button" aria-pressed="'+(songTab===k)+'" onclick="'+lifeCall('songSetTab',k)+'">'+l+'</button>').join('')+'</div>'+
  '<div id="songPane">'+songPane(s)+'</div>';
}
function songSetTab(k){songTab=k;songSel=null;renderSongs()}
function songPane(s){
 if(songTab==='text')return '<div class="cal-grid2"><label class="life-name-field">Tempo (BPM)<input id="songBpm" type="number" inputmode="numeric" min="0" max="300" value="'+(s.bpm||'')+'" placeholder="z. B. 92" onchange="'+lifeCall('songSet',s.id,'bpm','#songBpm')+'"/></label><label class="life-name-field">Tonart<input id="songKey" maxlength="20" value="'+esc(s.key)+'" placeholder="z. B. d-Moll" onchange="'+lifeCall('songSet',s.id,'key','#songKey')+'"/></label></div>'+
  '<label class="life-name-field">Text<textarea id="songLyrics" class="song-lyrics" rows="14" placeholder="Text hier einfügen.\n\nLeerzeile = neuer Abschnitt\n[Refrain] = Abschnittsname\n/ = kurz atmen mitten in der Zeile" oninput="'+lifeCall('songLyricsInput',s.id)+'">'+esc(s.lyrics)+'</textarea></label>'+
  '<p class="life-footnote">Wird beim Tippen gespeichert. Markierungen hängen an der Zeile: Änderst du eine Zeile, beginnt ihre Markierung neu.</p>'+
  '<div class="life-detail-actions">'+lifeButton('Umbenennen',lifeCall('songRename',s.id),'life-btn')+lifeButton('Gesangskarte teilen',lifeCall('songShare',s.id),'life-btn')+lifeButton('Song löschen',lifeCall('songDelete',s.id),'life-textbtn danger')+'</div>';
 if(songTab==='takes')return '<div class="song-take-form"><span class="life-kicker">Neuer Take</span><div class="song-stars" role="group" aria-label="Bewertung">'+[1,2,3,4,5].map(n=>'<button type="button" aria-label="'+n+' Sterne" aria-pressed="false" onclick="songStar('+n+')">★</button>').join('')+'</div><label class="srOnly" for="songTakeNote">Notiz</label><textarea id="songTakeNote" rows="2" placeholder="Was war gut, was nicht? z. B. Strophe 2 zu gepresst"></textarea>'+lifeButton('Take speichern',lifeCall('songAddTake',s.id),'life-btn dark')+'</div>'+
  (s.takes.length?'<ul class="song-takes">'+[...s.takes].reverse().map(t=>'<li><span><b>'+'★'.repeat(t.rating)+'<span class="dim">'+'★'.repeat(5-t.rating)+'</span></b><small>'+esc(lifeDate(t.at.slice(0,10),{weekday:'short',day:'numeric',month:'short'}))+' · '+new Date(t.at).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'})+'</small>'+(t.note?'<p>'+esc(t.note)+'</p>':'')+'</span><button type="button" class="life-iconbtn" aria-label="Take löschen" onclick="'+lifeCall('songRemoveTake',s.id,t.at)+'">'+lifeGlyph('close')+'</button></li>').join('')+'</ul>':'<p class="life-none">Noch keine Takes.</p>');
 if(songTab==='refs'){
  const vids=PulseVault.ensure(db).items,linked=vids.filter(v=>s.refs.includes(v.id)),q=songRefQuery.trim().toLocaleLowerCase('de');
  const pick=vids.filter(v=>!s.refs.includes(v.id)&&(!q||[v.title,v.channel,v.note].join(' ').toLocaleLowerCase('de').includes(q))).slice(0,30);
  return (linked.length?'<div class="vault-grid">'+linked.map(v=>'<div class="song-ref">'+vaultCard(v)+lifeButton('Lösen',lifeCall('songLink',s.id,v.id,false),'life-textbtn')+'</div>').join('')+'</div>':'<p class="life-none">Noch keine Referenzen. Verknüpfe Videos aus deiner Sammlung, z. B. die Version, nach der ihr klingen wollt, oder Technik-Tutorials.</p>')+
   (vids.length?'<div class="vault-block"><h3>Aus deiner Sammlung verknüpfen</h3><label class="life-search">'+lifeGlyph('search')+'<input id="songRefSearch" type="search" aria-label="Videos suchen" placeholder="Suchen …" value="'+esc(songRefQuery)+'" oninput="songRefQuery=this.value;document.getElementById(\'songRefPick\').innerHTML=songRefList()"/></label><div id="songRefPick">'+songRefList()+'</div></div>':'<p class="life-footnote">Deine Videosammlung ist noch leer.</p>');
 }
 const sections=PulseSong.parse(s.lyrics);
 if(!sections.length)return lifeEmpty('Noch kein Text.','Füge den Text unter „Text“ ein, dann kannst du ihn hier Zeile für Zeile markieren.',lifeCall('songSetTab','text'),'Zum Text');
 const c=PulseSong.coverage(s);
 return '<p class="song-legend">Wort antippen = betonen. Zeilenanfang antippen = Dynamik, Farbe, Atem, Notiz. <b>'+c.done+'/'+c.lines+'</b> Zeilen markiert.</p>'+sections.map(sec=>'<section class="song-section">'+(sec.label?'<h3>'+esc(sec.label)+'</h3>':'')+sec.map(l=>songLine(s,l)).join('')+'</section>').join('');
}
function songRefList(){const s=PulseSong.get(db,songOpenId);if(!s)return '';const q=songRefQuery.trim().toLocaleLowerCase('de');const pick=PulseVault.ensure(db).items.filter(v=>!s.refs.includes(v.id)&&(!q||[v.title,v.channel,v.note].join(' ').toLocaleLowerCase('de').includes(q))).slice(0,30);return pick.length?pick.map(v=>'<button type="button" class="cal-row" onclick="'+lifeCall('songLink',s.id,v.id,true)+'"><span class="cal-when">'+esc(vaultNo(v.no))+'</span><span class="cal-what"><b>'+esc(v.title||'Ohne Titel')+'</b><small>'+esc(v.channel||'')+'</small></span></button>').join(''):'<p class="life-none">Keine passenden Videos.</p>'}
function songWordsHTML(l,n,stage){
 const emph=new Set(n.emph||[]),breaths=new Set(l.breaths);
 return l.words.map((w,i)=>(breaths.has(i)?'<span class="song-breath" title="atmen">◡</span>':'')+(stage?'<span class="'+(emph.has(i)?'emph':'')+'">'+esc(w)+'</span>':'<button type="button" class="song-word'+(emph.has(i)?' emph':'')+'" aria-pressed="'+emph.has(i)+'" onclick="'+lifeCall('songEmph',l.key,i)+'">'+esc(w)+'</button>')).join(' ');
}
function songTags(n){return [n.dyn&&songLabel(PulseSong.DYN,n.dyn),n.color&&songLabel(PulseSong.COLOR,n.color)].filter(Boolean)}
function songLine(s,l){
 const n=s.notes[l.key]||{},sel=songSel===l.key,tags=songTags(n);
 return '<div class="song-line'+(sel?' sel':'')+'" style="--dyn:'+(DYN_COLOR[n.dyn]||'var(--line-strong)')+'"><button type="button" class="song-line-head" aria-expanded="'+sel+'" aria-label="Zeile bearbeiten: '+esc(l.text)+'" onclick="'+lifeCall('songSelect',l.key)+'">'+(n.breath?'<span class="song-breath">◡</span>':'<span class="song-dot"></span>')+'</button><div class="song-line-body"><p class="song-words">'+songWordsHTML(l,n,false)+'</p>'+(tags.length||n.note?'<p class="song-meta">'+esc(tags.join(' · '))+(n.note?(tags.length?' · ':'')+'<i>'+esc(n.note)+'</i>':'')+'</p>':'')+
  (sel?'<div class="song-tools"><div class="vault-chips" role="group" aria-label="Dynamik">'+PulseSong.DYN.map(([k,lb])=>'<button type="button" aria-pressed="'+(n.dyn===k)+'" style="--chip:'+DYN_COLOR[k]+'" onclick="'+lifeCall('songNote',l.key,'dyn',n.dyn===k?null:k)+'">'+lb+'</button>').join('')+'</div><div class="vault-chips" role="group" aria-label="Klangfarbe">'+PulseSong.COLOR.map(([k,lb])=>'<button type="button" aria-pressed="'+(n.color===k)+'" onclick="'+lifeCall('songNote',l.key,'color',n.color===k?null:k)+'">'+lb+'</button>').join('')+'</div>'+
   '<div class="vault-chips"><button type="button" aria-pressed="'+!!n.breath+'" onclick="'+lifeCall('songNote',l.key,'breath',!n.breath)+'">◡ Atmen davor</button></div><div class="vault-inline"><label class="srOnly" for="songNoteInput">Notiz zur Zeile</label><input id="songNoteInput" data-key="'+esc(l.key)+'" maxlength="300" value="'+esc(n.note||'')+'" placeholder="Notiz, z. B. Stimme bricht hier absichtlich" onkeydown="if(event.key===\'Enter\'){event.preventDefault();songNoteSave(this.dataset.key)}"/>'+lifeButton('OK',lifeCall('songNoteSave',l.key),'life-btn')+'</div></div>':'')+'</div></div>';
}
function songSelect(k){songSel=songSel===k?null:k;renderSongs()}
function songMutate(fn){if(!songTry(fn))return;songSave();skyCheck()}
function songEmph(k,i){songMutate(()=>PulseSong.toggleEmphasis(db,songOpenId,k,i,songNow()));pulseTap(5)}
function songNote(k,field,v){songMutate(()=>PulseSong.annotate(db,songOpenId,k,{[field]:v},songNow()));pulseTap(5)}
function songNoteSave(k){const v=document.getElementById('songNoteInput')?.value||'';document.getElementById('songNoteInput')?.blur();songMutate(()=>PulseSong.annotate(db,songOpenId,k,{note:v},songNow()))}
function songSet(id,field,v){if(typeof v==='string'&&v.startsWith('#'))v=document.querySelector(v)?.value;songMutate(()=>PulseSong.update(db,id,{[field]:v},songNow()))}
function songLyricsInput(id){clearTimeout(songSaveTimer);songSaveTimer=setTimeout(()=>{const v=document.getElementById('songLyrics')?.value;if(v==null)return;try{PulseSong.update(db,id,{lyrics:v},songNow());save()}catch(_){}},500)}
function songNew(){
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Neuer Song</h2><label class="life-name-field">Titel<input id="songNewTitle" maxlength="120" placeholder="Songtitel"/></label><label class="life-name-field">Text (optional)<textarea id="songNewLyrics" rows="8" placeholder="Text einfügen, Leerzeile = neuer Abschnitt"></textarea></label><div class="life-detail-actions">'+lifeButton('Anlegen','songCreate()','life-btn dark')+lifeButton('Abbrechen','lifeCloseSheet()','life-btn')+'</div>';
 openDialog(document.getElementById('lifeSheet'),'#songNewTitle');
}
function songCreate(){let x;if(!songTry(()=>{x=PulseSong.create(db,{title:document.getElementById('songNewTitle').value,lyrics:document.getElementById('songNewLyrics').value},songNow())}))return;if(!save())return;lifeCloseSheet();songTab=x.lyrics?'karte':'text';lifeOpenSongs(x.id);skyCheck()}
function songRename(id){const s=PulseSong.get(db,id);if(!s)return;document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Umbenennen</h2><label class="life-name-field">Titel<input id="songRenameInput" maxlength="120" value="'+esc(s.title)+'"/></label><div class="life-detail-actions">'+lifeButton('Speichern',lifeCall('songRenameSave',id),'life-btn dark')+'</div>';openDialog(document.getElementById('lifeSheet'),'#songRenameInput')}
function songRenameSave(id){if(songTry(()=>PulseSong.update(db,id,{title:document.getElementById('songRenameInput').value},songNow()))){save();lifeCloseSheet();renderSongs()}}
function songDelete(id){pushUndo({type:'songs',before:PulseLife.clone(db.songs)});PulseSong.remove(db,id);songOpenId=null;songSave();toast('Song gelöscht','Rückgängig')}
function undoSongs(u){db.songs=u.before;PulseSong.normalize(db);save();renderSongs();toast('Wiederhergestellt')}
let songStars=0;
function songStar(n){songStars=n;document.querySelectorAll('.song-stars button').forEach((b,i)=>{b.setAttribute('aria-pressed',String(i<n));b.classList.toggle('on',i<n)})}
function songAddTake(id){const note=document.getElementById('songTakeNote')?.value||'';if(!songStars&&!note.trim())return toast('Sterne vergeben oder eine Notiz schreiben.');songMutate(()=>PulseSong.addTake(db,id,{rating:songStars,note},songNow()));songStars=0;pulseSound('pop');toast('Take gespeichert')}
function songRemoveTake(id,at){songMutate(()=>PulseSong.removeTake(db,id,at,songNow()))}
function songLink(id,ref,on){songMutate(()=>PulseSong.link(db,id,ref,on,songNow()))}
async function songShare(id){const s=PulseSong.get(db,id);if(!s)return;const text=PulseSong.sheet(s);try{if(navigator.share){await navigator.share({title:s.title,text});return}}catch(_){return}try{await navigator.clipboard.writeText(text);toast('Gesangskarte kopiert')}catch(_){calDownload(text,s.title.replace(/[^\wäöüÄÖÜß -]/g,'')+'.txt')}}
function songMetro(id){const s=PulseSong.get(db,id);if(PulseMetronome.running()){PulseMetronome.stop();renderSongs();return}PulseMetronome.start(s?.bpm||90,b=>{document.querySelectorAll('.metro-dot').forEach(d=>{d.classList.toggle('accent',b===0);d.classList.remove('beat');void d.offsetWidth;d.classList.add('beat')})});renderSongs()}
/* ---------- Stage mode ---------- */
async function songStageOpen(id){
 const s=PulseSong.get(db,id);if(!s)return;const lines=PulseSong.parse(s.lyrics).flatMap((sec,si)=>sec.map((l,i)=>({...l,label:i===0?sec.label||'':'',first:i===0&&si>0})));
 if(!lines.length)return toast('Der Song hat noch keinen Text.');
 let lock=null;try{lock=await navigator.wakeLock?.request('screen')}catch(_){}
 songStage={id,lines,i:0,lock};
 let el=document.getElementById('songStage');if(!el){el=document.createElement('div');el.id='songStage';document.body.appendChild(el)}
 el.className='song-stage';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Bühnenmodus: '+s.title);el.hidden=false;document.body.classList.add('sigil-open');
 el.innerHTML='<div class="song-stage-top"><b>'+esc(s.title)+'</b><span class="metro-dot" aria-hidden="true"></span><button type="button" onclick="'+lifeCall('songStageMetro',id)+'">'+(PulseMetronome.running()?'Klick aus':'Klick'+(s.bpm?' '+s.bpm:''))+'</button><button type="button" onclick="songStageClose()" aria-label="Schließen">✕</button></div>'+
  '<div class="song-stage-lines" onclick="songStageMove(1)">'+lines.map((l,i)=>{const n=s.notes[l.key]||{},tags=songTags(n);return (l.label||l.first?'<p class="song-stage-label">'+esc(l.label||'·')+'</p>':'')+'<p class="song-stage-line" data-i="'+i+'" style="--dyn:'+(DYN_COLOR[n.dyn]||'transparent')+'">'+(n.breath?'<span class="song-breath">◡</span> ':'')+songWordsHTML(l,n,true)+(tags.length||n.note?'<small>'+esc(tags.join(' · '))+(n.note?(tags.length?' · ':'')+esc(n.note):'')+'</small>':'')+'</p>'}).join('')+'</div>'+
  '<div class="song-stage-nav"><button type="button" onclick="songStageMove(-1)" aria-label="Zeile zurück">‹</button><span id="songStagePos"></span><button type="button" onclick="songStageMove(1)" aria-label="Nächste Zeile">›</button></div>';
 songStageMove(0);el.querySelector('button')?.focus();
}
function songStageMove(d){if(!songStage)return;songStage.i=Math.max(0,Math.min(songStage.lines.length-1,songStage.i+d));document.querySelectorAll('.song-stage-line').forEach(p=>p.classList.toggle('now',Number(p.dataset.i)===songStage.i));const cur=document.querySelector('.song-stage-line.now');cur?.scrollIntoView({block:'center',behavior:reducedMotion()?'auto':'smooth'});const pos=document.getElementById('songStagePos');if(pos)pos.textContent=(songStage.i+1)+' / '+songStage.lines.length}
function songStageMetro(id){songMetro(id);const s=PulseSong.get(db,id),b=document.querySelector('.song-stage-top button');if(b)b.textContent=PulseMetronome.running()?'Klick aus':'Klick'+(s?.bpm?' '+s.bpm:'')}
function songStageClose(){if(!songStage)return;try{songStage.lock?.release()}catch(_){}PulseMetronome.stop();songStage=null;const el=document.getElementById('songStage');if(el){el.hidden=true;el.innerHTML=''}document.body.classList.remove('sigil-open');renderSongs()}
document.addEventListener('keydown',e=>{if(songStage){if(e.key==='Escape')songStageClose();else if(['ArrowDown','ArrowRight',' ','PageDown'].includes(e.key)){e.preventDefault();songStageMove(1)}else if(['ArrowUp','ArrowLeft','PageUp'].includes(e.key)){e.preventDefault();songStageMove(-1)}}if(songWarm&&e.key==='Escape')songWarmClose()});
/* ---------- Warm-up ---------- */
const WARM_ROOTS=[['A2',110],['C3',130.81],['E3',164.81],['G3',196],['A3',220],['C4',261.63]];
function warmSteps(extreme){
 const S=[['Lockern',60,'Schultern kreisen, Nacken sanft dehnen, Kiefer locker hängen lassen, gähnen.',false],['Atmen',60,'4 Zählzeiten durch die Nase ein, 8 auf „sss“ aus. Bauch und Flanken weiten sich, Schultern bleiben unten.',false],['Summen',60,'Auf dem Grundton summen, Lippen locker zu. Spür das Kribbeln an Lippen und Nase.',true],['Lippenflattern',60,'Lippen flattern lassen und dabei Sirenen von tief nach hoch und zurück gleiten.',false],['ng-Sirenen',60,'Auf „ng“ wie in „singen“ sanft durch den ganzen Umfang gleiten. Ohne Druck.',false],['Vokale',60,'Auf dem Grundton i – e – a – o – u, ohne Pause dazwischen. Der Ton bleibt gleich, nur der Mund ändert sich.',true],['Twang',45,'Kurz und frech „nyeh nyeh nyeh“, wie eine quengelnde Hexe. Das bringt Kraft ohne Druck.',false]];
 if(extreme)S.push(['Fry und Verzerrung',45,'Sehr leises Vocal Fry wie eine knarrende Tür, dann vorsichtig etwas Luft dazu. Kehle bleibt weit, wie beim Gähnen. Kein Pressen, kein Kratzen. Schmerz oder Heiserkeit: sofort aufhören.',false]);
 S.push(['Einen Teil singen',60,'Eine Strophe oder den Refrain locker auf halber Kraft anstimmen.',false]);return S;
}
function songWarmStart(extreme=false,root=null){
 songWarmClose(true);const r=root??(Number(db.uiPrefs.warmRoot)||220);db.uiPrefs.warmRoot=r;
 songWarm={steps:warmSteps(extreme),i:0,left:0,paused:false,timer:null,extreme,root:r,tone:false};
 let el=document.getElementById('songWarm');if(!el){el=document.createElement('div');el.id='songWarm';document.body.appendChild(el)}
 el.className='song-stage warm';el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Einsingen');el.hidden=false;document.body.classList.add('sigil-open');
 warmGo(0);songWarm.timer=setInterval(warmTick,1000);
}
function warmRender(){
 const w=songWarm,el=document.getElementById('songWarm');if(!w||!el)return;const [title,,text,tone]=w.steps[w.i];
 el.innerHTML='<div class="song-stage-top"><b>Einsingen · '+(w.i+1)+' von '+w.steps.length+'</b><button type="button" onclick="songWarmClose()" aria-label="Schließen">✕</button></div><div class="warm-body"><div class="warm-progress" aria-hidden="true">'+w.steps.map((_,i)=>'<i class="'+(i<w.i?'done':i===w.i?'now':'')+'"></i>').join('')+'</div><h2>'+esc(title)+'</h2><p class="warm-text">'+esc(text)+'</p><span class="sigil-clock" id="warmClock">'+lifeClock(w.left)+'</span>'+
  (tone?'<p class="warm-tone">'+(w.tone?'Grundton klingt':'Grundton')+'</p>':'')+
  '<div class="sigil-row">'+lifeButton(w.paused?'Weiter':'Pause','warmPause()','')+lifeButton('Nächster Schritt','warmGo(songWarm.i+1)','')+'</div>'+
  '<div class="sigil-row" role="group" aria-label="Grundton">'+WARM_ROOTS.map(([n,f])=>'<button type="button" aria-pressed="'+(w.root===f)+'" onclick="warmRoot('+f+')">'+n+'</button>').join('')+'</div>'+
  '<div class="sigil-row"><button type="button" aria-pressed="'+w.extreme+'" onclick="songWarmStart('+!w.extreme+','+w.root+')">Mit Scream/Growl-Teil</button></div><p class="warm-safe">Ersetzt keinen Gesangsunterricht. Bei Schmerz, Kratzen oder Heiserkeit aufhören und Wasser trinken.</p></div>';
}
function warmGo(i){const w=songWarm;if(!w)return;if(i>=w.steps.length)return warmDone();w.i=i;w.left=w.steps[i][1];w.paused=false;w.tone=!!w.steps[i][3];if(w.tone)PulseTone.play(w.root);else PulseTone.stop();if(i>0){pulseSound('pop');pulseTap(15)}warmRender()}
function warmTick(){const w=songWarm;if(!w||w.paused)return;w.left--;const c=document.getElementById('warmClock');if(c)c.textContent=lifeClock(Math.max(0,w.left));if(w.left<=0)warmGo(w.i+1)}
function warmPause(){const w=songWarm;if(!w)return;w.paused=!w.paused;if(w.paused)PulseTone.stop();else if(w.tone)PulseTone.play(w.root);warmRender()}
function warmRoot(f){const w=songWarm;if(!w)return;w.root=f;db.uiPrefs.warmRoot=f;save();if(w.tone&&!w.paused)PulseTone.play(f);warmRender()}
function warmDone(){const n=PulseSong.warmup(db,key());save();songWarmClose();pulseSound('chime');toast('Eingesungen. Das war Nummer '+n+'.');skyCheck()}
function songWarmClose(silent){const w=songWarm;if(w){clearInterval(w.timer);PulseTone.stop()}songWarm=null;const el=document.getElementById('songWarm');if(el){el.hidden=true;el.innerHTML=''}if(!silent)document.body.classList.remove('sigil-open')}
