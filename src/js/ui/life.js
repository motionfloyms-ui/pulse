// SOURCE: ui/life.js
/* Lebensräume UI. New shell; existing body tools use their established commands. */
let lifeSelectedDay=null,lifeMonthOpen=false,lifeCurrentRoom=null,lifeQuery='',lifeKindFilter='',lifeEditingId=null,lifeRenderedDate=null;
const lifeTemplates={
gedanke:{kind:'note',room:'innen',title:'',body:'',hint:''},
reflexion:{kind:'note',room:'innen',title:'Was gerade in mir los ist',body:'Was beschäftigt mich?\n\nWas brauche ich?\n\nWas kann warten?\n'},
ritual:{kind:'ritual',room:'sinn',title:'Mein eigenes Ritual',body:'Meine Absicht:\n\nWas ich dafür brauche:\n\nMeine Praxis:\n\nWas ich mitnehmen möchte:\n',duration:10},
traum:{kind:'note',room:'sinn',title:'Traum',body:'Woran erinnere ich mich?\n\nBilder und Gefühle:\n\nMeine persönliche Deutung:\n'},
natur:{kind:'note',room:'draussen',title:'Beobachtung',body:'Ort:\n\nWas mir aufgefallen ist:\n\nWas ich darüber herausfinden möchte:\n'},
idee:{kind:'project',room:'ideen',title:'Neue Idee',body:'Die Idee:\n\nWas mich daran reizt:\n\nEin erster kleiner Versuch:\n'},
rezept:{kind:'recipe',room:'koerper',title:'Rezept',body:'So mache ich es:\n\n',steps:[],hint:'Zutaten unten einzeln eintragen. Daraus entsteht später deine Einkaufsliste.'},
kontakt:{kind:'task',room:'menschen',title:'Treffen planen',body:'Mit wem?\n\nEine Idee für uns:\n',duration:10},
haushalt:{kind:'task',room:'zuhause',title:'Haushalt',body:'Was ist zu tun?\n',duration:10},
papier:{kind:'project',room:'alltag',title:'Vorgang klären',body:'Worum geht es?\n\nUnterlagen / Quelle:\n\nWarte ich auf jemanden?\n\nNächster Schritt:\n'}
};
function lifeCall(name,...args){return esc(name+'('+args.map(x=>JSON.stringify(x)).join(',')+')')}
function lifeButton(label,call,cls='life-btn'){return '<button type="button" class="'+cls+'" onclick="'+call+'">'+label+'</button>'}
function lifeGlyph(name,cls=''){
 const paths={
  arch:'<path d="M12 52V29a20 20 0 0 1 40 0v23M23 52V30a9 9 0 0 1 18 0v22M8 52h48"/>',
  wave:'<path d="M5 23c10-18 18 18 28 0s18 18 27 0M5 34c10-18 18 18 28 0s18 18 27 0M5 45c10-18 18 18 28 0s18 18 27 0"/>',
  star:'<path d="m32 6 5 18 17-5-12 13 12 13-17-5-5 18-5-18-17 5 12-13-12-13 17 5Z"/><circle cx="32" cy="32" r="4"/>',
  leaf:'<path d="M32 55V29M32 39C9 39 9 17 9 17s23 0 23 22ZM32 29c0-22 23-22 23-22s0 22-23 22ZM32 51c0-17 22-18 22-18S54 51 32 51Z"/>',
  link:'<circle cx="25" cy="32" r="18"/><circle cx="41" cy="32" r="18"/>',
  sun:'<circle cx="32" cy="32" r="13"/><path d="M32 3v10M32 51v10M3 32h10M51 32h10M11 11l7 7M46 46l7 7M11 53l7-7M46 18l7-7"/>',
  mountain:'<path d="m3 51 20-30 12 18 9-12 18 24ZM17 30l6 5 5-6"/><circle cx="43" cy="13" r="6"/>',
  home:'<path d="m6 30 26-21 26 21M13 27v28h38V27M27 55V38h10v17"/>',
  day:'<rect x="9" y="14" width="46" height="43" rx="8"/><path d="M9 27h46M21 7v14M43 7v14M21 38h7M36 38h7M21 46h7"/>',
  rooms:'<rect x="7" y="7" width="20" height="20" rx="6"/><circle cx="46" cy="17" r="10"/><path d="m17 36 11 19H6Z"/><rect x="36" y="36" width="20" height="20" rx="6"/>',
  book:'<path d="M32 15C23 8 10 9 5 12v40c10-4 21-3 27 3 6-6 17-7 27-3V12c-5-3-18-4-27 3v40M13 22h10M13 32h10M41 22h10M41 32h10"/>',
  focus:'<circle cx="32" cy="32" r="24"/><circle cx="32" cy="32" r="12"/><circle cx="32" cy="32" r="2"/>',
  plus:'<path d="M32 12v40M12 32h40"/>',
  search:'<circle cx="27" cy="27" r="17"/><path d="m40 40 16 16"/>',
  arrow:'<path d="M12 32h40M37 17l15 15-15 15"/>',
  close:'<path d="m16 16 32 32M16 48l32-32"/>',
  check:'<path d="m12 32 13 13 28-28"/>',
  settings:'<path d="M9 17h46M9 32h46M9 47h46"/><circle cx="23" cy="17" r="5" fill="currentColor"/><circle cx="43" cy="32" r="5" fill="currentColor"/><circle cx="20" cy="47" r="5" fill="currentColor"/>'
 };
 return '<svg class="life-glyph '+cls+'" viewBox="0 0 64 64" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+(paths[name]||paths.star)+'</svg>';
}
function lifeState(){return PulseLife.ensure(db)}
function lifeDate(date,options={weekday:'long',day:'numeric',month:'long'}){return new Date(date+'T12:00:00').toLocaleDateString('de-DE',options)}
function lifeHeader(kicker,title,desc=''){return '<header class="life-pagehead"><span class="life-kicker">'+kicker+'</span><h1>'+title+'</h1>'+(desc?'<p>'+desc+'</p>':'')+'</header>'}
function lifePill(text,color=''){return '<span class="life-pill '+color+'">'+esc(text)+'</span>'}
function lifeTemplate(keyName){const t=lifeTemplates[keyName];if(t)lifeCompose(t)}
function lifeGreeting(){const h=new Date().getHours();return (h<5?'Gute Nacht':h<11?'Guten Morgen':h<17?'Hallo':h<22?'Guten Abend':'Gute Nacht')+((db.settings.name||'').trim()?', '+db.settings.name.trim():'')}
function lifeSelectDay(day){if(!PulseLife.validDate(day))return;lifeSelectedDay=day;renderLifeToday()}
function lifeMoveDay(n){lifeSelectDay(PulseLife.offset(lifeSelectedDay||key(),n))}
function lifeCard(x,{compact=false}={}){
 const r=PulseLife.room(x.room),status={done:'Erledigt',waiting:'Wartet',parked:'Geparkt'}[x.status];
 const series=x.kind==='event'&&x.recur?'↻ '+PulseRecur.describe({...x,recur:{...x.recur,until:'',count:0}}):'';
 const tags=[PulseLife.KINDS[x.kind],series,status,x.deadline?'Frist '+lifeDate(x.deadline,{day:'numeric',month:'short'}):'',x.photos?.length?x.photos.length+(x.photos.length===1?' Foto':' Fotos'):'',itemVideo(x)?'Video':''].filter(Boolean).join(' · ');
 const check=x.kind==='task'?'<button type="button" class="life-check '+(x.status==='done'?'checked':'')+'" aria-label="'+esc((x.status==='done'?'Wieder öffnen: ':'Erledigen: ')+x.title)+'" onclick="'+lifeCall('lifeToggle',x.id)+'">'+(x.status==='done'?lifeGlyph('check'):'<span></span>')+'</button>':'<span class="life-entry-symbol '+r.color+'">'+lifeGlyph(r.symbol)+'</span>';
 return '<article class="life-entry '+(compact?'compact ':'')+(x.status==='done'?'is-done':'')+(x.id===lifeJustDone&&Date.now()-lifeJustDoneAt<1500?' just-done':'')+'">'+check+'<button type="button" class="life-entry-open" onclick="'+lifeCall('lifeOpenItem',x.id)+'"><span class="life-entry-title">'+esc(x.title)+'</span><span class="life-entry-meta">'+esc(tags)+'</span>'+(!compact&&x.body?'<span class="life-entry-excerpt">'+esc(x.body.slice(0,130))+'</span>':'')+'</button><span class="life-entry-arrow" aria-hidden="true">↗</span></article>';
}
function lifeEmpty(title,text,action,label='Hinzufügen'){return '<div class="life-empty"><b>'+title+'</b><p>'+text+'</p>'+(action?lifeButton(label,action,'life-textbtn'):'')+'</div>'}
function lifeOpenSpaces(id=null){if(!id)return lifeOpenMore();lifeCurrentRoom=id;goView('spaces')}
function renderLifeSpaces(){
 const el=document.getElementById('lifeSpaceContent');if(!el)return;
 if(!lifeCurrentRoom){el.innerHTML=lifeHeader('','Räume','')+'<div class="life-room-grid">'+PulseLife.ROOMS.map(r=>{const n=PulseLife.list(db).filter(x=>x.room===r.id);return '<button type="button" class="life-room-tile '+r.color+'" onclick="'+lifeCall('lifeOpenSpaces',r.id)+'"><span class="life-room-number">'+String(PulseLife.ROOMS.indexOf(r)+1).padStart(2,'0')+'</span>'+lifeGlyph(r.symbol)+'<span class="life-room-title">'+r.name+'</span><span class="life-room-sub">'+r.sub+'</span><span class="life-room-foot">'+(n.length?n.length+' eigene · ':'')+PulseLibrary.forRoom(r.id).length+' Inhalte'+' <b>↗</b></span></button>'}).join('')+'</div>';return}
 const r=PulseLife.room(lifeCurrentRoom),items=PulseLife.search(db,'','',r.id),prompts={alltag:['papier','haushalt'],innen:['reflexion','gedanke'],sinn:['ritual','traum'],koerper:['rezept'],menschen:['kontakt'],ideen:['idee'],draussen:['natur'],zuhause:['haushalt']};
 const names={papier:'Vorgang (Papierkram)',haushalt:'Haushalt',reflexion:'Reflexion',gedanke:'Freie Notiz',ritual:'Ritual',traum:'Traumtagebuch',rezept:'Rezept',kontakt:'Treffen planen',idee:'Projektidee',natur:'Beobachtung'};
 el.innerHTML=moreBack()+'<header class="life-room-hero '+r.color+'"><div><h1>'+r.name+'</h1><p>'+r.sub+'</p></div>'+lifeGlyph(r.symbol)+'</header>'+
 '<div class="life-room-actions">'+lifeButton('＋ Eintrag',lifeCall('lifeCompose',{room:r.id}),'life-btn dark')+lifeButton('＋ Projekt',lifeCall('lifeCompose',{room:r.id,kind:'project'}),'life-btn')+'</div>'+
 (r.id==='koerper'?'<div class="life-tool-ribbon">'+[['Essen & Trinken','nutrition'],['Training','workout'],['Befinden','recovery'],['Körperverlauf','history']].map(([t,v])=>lifeButton(t+' ↗',lifeCall('lifeLegacy',v),'life-tool-link')).join('')+'</div>':'')+
 lifeLibSection(r.id)+'<div class="life-sectionhead"><h2>Vorlagen</h2></div><div class="life-template-row">'+(prompts[r.id]||[]).map(t=>lifeButton(names[t]+' ↗',lifeCall('lifeTemplate',t),'life-template')).join('')+'</div>'+
 '<div class="life-sectionhead"><h2>Deine Einträge</h2><span class="life-subtle">'+items.length+' Einträge</span></div>'+
 (items.length?items.map(x=>lifeCard(x)).join(''):lifeEmpty('Noch keine Einträge in diesem Raum.',''));
}
function lifeOpenLibrary(kind='',query=''){lifeKindFilter=kind;lifeQuery=query;goView('library');if(query==='')document.getElementById('lifeSearch')?.focus()}
function lifeFilter(kind){lifeKindFilter=kind;renderLifeLibrary()}
function lifeSearchChanged(value){lifeQuery=value;renderLifeLibraryResults()}
function renderLifeLibraryResults(){
 const el=document.getElementById('lifeLibraryResults');if(!el)return;
 if(lifeKindFilter==='lib'){const all=lifeQuery.trim()?PulseLibrary.search(lifeQuery):PulseLibrary.ENTRIES;el.innerHTML='<p class="life-result-count">'+all.length+' Inhalte aus der Bibliothek</p>'+(lifeQuery.trim()?'<div class="life-lib-grid">'+all.map(libCard).join('')+'</div>':PulseLife.ROOMS.map(r=>{const list=all.filter(e=>e.room===r.id);return list.length?'<h3 class="life-lib-grouphead">'+esc(r.name)+' <span>'+list.length+'</span></h3><div class="life-lib-grid">'+list.map(libCard).join('')+'</div>':''}).join(''))+'<div class="life-room-actions">'+lifeButton('Tarot nachschlagen',lifeCall('lifeTarotBrowse','major',false),'life-btn')+'</div>';return}
 const items=lifeKindFilter==='video'?PulseLife.search(db,lifeQuery,'','',false).filter(itemVideo):PulseLife.search(db,lifeQuery,lifeKindFilter==='archive'?'':lifeKindFilter,'',lifeKindFilter==='archive');
 const own=items.length?'<p class="life-result-count">'+items.length+' '+(items.length===1?'eigener Eintrag':'eigene Einträge')+'</p>'+items.map(x=>lifeCard(x)).join(''):'';
 const lib=lifeQuery.trim()&&!lifeKindFilter?libSearchHTML(lifeQuery):'';
 if(!own&&lifeKindFilter==='video'&&!lifeQuery.trim()){el.innerHTML=lifeEmpty('Noch keine Videos.','In der YouTube-App auf „Teilen“ tippen und Pulse wählen, oder einen Link in die Eingabezeile einfügen.',"lifeQuick()",'Link einfügen');return}
 el.innerHTML=own+lib||lifeEmpty(lifeQuery?'Keine Treffer.':'Noch keine Einträge.',lifeQuery?'Gesucht wird in deinen Einträgen, der Bibliothek und allen Tarotkarten.':'Fertige Inhalte findest du unter „Bibliothek“.',lifeCall('lifeFilter','lib'),'Bibliothek öffnen');
}
function renderLifeLibrary(){
 const el=document.getElementById('lifeLibraryContent');if(!el)return;
 el.innerHTML=moreBack()+lifeHeader('',lifeKindFilter==='lib'?'Bibliothek':'Alle Einträge','')+'<label class="life-search">'+lifeGlyph('search')+'<input id="lifeSearch" type="search" aria-label="Einträge und Bibliothek durchsuchen" placeholder="Suchen: Einträge, Rezepte, Tarot …" oninput="lifeSearchChanged(this.value)" value="'+esc(lifeQuery)+'"/></label><div class="life-filterbar">'+[['','Alles'],['lib','Bibliothek'],...Object.entries(PulseLife.KINDS),['archive','Archiv']].map(([k,label])=>'<button type="button" aria-pressed="'+(lifeKindFilter===k)+'" onclick="'+lifeCall('lifeFilter',k)+'">'+label+'</button>').join('')+'</div><div id="lifeLibraryResults"></div>';
 renderLifeLibraryResults();
}
function lifeClock(sec){return Math.floor(sec/60).toString().padStart(2,'0')+':'+Math.floor(sec%60).toString().padStart(2,'0')}
function renderLifeFocus(){
 const el=document.getElementById('lifeFocusContent');if(!el||document.activeElement?.id==='lifeResumeNote')return;
 const f=lifeState().focus;
 if(!f){
 const candidates=PulseLife.list(db).filter(x=>['task','ritual'].includes(x.kind)&&x.status==='open').slice(0,8);
 el.innerHTML=moreBack()+lifeHeader('','Fokus-Timer','')+'<div class="life-focus-idle"><div class="life-idle-orbit">'+lifeGlyph('focus')+'</div><h2>Timer starten</h2><p>Frei oder für eine Aufgabe unten.</p><div class="life-duration-choices">'+[5,10,25].map(n=>lifeButton(n+' Minuten',lifeCall('lifeBeginFocus',null,n),'life-btn '+(n===10?'dark':''))).join('')+'</div>'+soundChips('Klang')+'</div><div class="life-sectionhead"><h2>Für eine Aufgabe</h2></div>'+(candidates.length?candidates.map(x=>'<div class="life-focus-choice">'+lifeCard(x,{compact:true})+lifeButton('Starten',lifeCall('lifeBeginFocus',x.id,x.duration||10),'life-textbtn')+'</div>').join(''):lifeEmpty('Keine offenen Aufgaben oder Rituale.',''));return}
 const left=PulseLife.remaining(f,Date.now()),item=PulseLife.get(db,f.id);
 el.innerHTML=lifeHeader(f.state==='paused'?'Pausiert':'Läuft',esc(f.title))+
 '<div class="life-focus-stage"><div id="lifeFocusRing" class="life-focus-ring" style="--progress:'+(Math.max(0,Math.min(100,left/f.total*100)))+'%"><div><span id="lifeFocusClock" role="timer" aria-live="off">'+lifeClock(left)+'</span><span id="lifeFocusStatus">'+(f.state==='paused'?'Pausiert':left?'verbleibend':'Zeit abgelaufen')+'</span></div></div>'+
 '<div class="life-duration-choices">'+lifeButton(f.state==='paused'?'Weiter':'Pause',lifeCall('lifePauseToggle'),'life-btn dark')+lifeButton('＋ 5 Min.',lifeCall('lifeAddFocus',5),'life-btn')+'</div>'+soundChips('Klang')+'</div>'+
 '<label class="life-resume-label">Notiz zum Weitermachen<textarea id="lifeResumeNote" rows="2" placeholder="Wo machst du weiter?" oninput="lifeRememberResume(this.value)">'+esc(f.resume||'')+'</textarea></label>'+
 (item?'<div class="life-focus-context"><b>'+esc(item.title)+'</b><p>'+esc(item.body.slice(0,400))+'</p>'+lifeButton('Eintrag öffnen ↗',lifeCall('lifeOpenItem',item.id),'life-textbtn')+'</div>':'')+
 '<div class="life-focus-finish">'+(item?.kind==='task'?lifeButton('Aufgabe erledigt',lifeCall('lifeFinishFocus',true),'life-btn dark'):'')+lifeButton('Beenden',lifeCall('lifeFinishFocus',false),'life-btn')+'</div><p class="life-footnote">Ein abgelaufener Timer hakt nichts ab.</p>';
}
function lifeTick(){
 const f=db?.life?.focus;if(!f)return;const left=PulseLife.remaining(f,Date.now());
 const clock=document.getElementById('lifeFocusClock'),mini=document.getElementById('lifeMiniClock'),ring=document.getElementById('lifeFocusRing'),status=document.getElementById('lifeFocusStatus');
 if(clock)clock.textContent=lifeClock(left);if(mini)mini.textContent=lifeClock(left);
 if(ring)ring.style.setProperty('--progress',Math.max(0,Math.min(100,left/f.total*100))+'%');
 if(status)status.textContent=f.state==='paused'?'Pausiert':left?'verbleibend':'Zeit abgelaufen';
}
function lifeBeginFocus(id,minutes){
 if(lifeState().focus){goView('focus');return toast('Es läuft bereits ein Timer.')}
 const item=id?PulseLife.get(db,id):null;
 try{PulseLife.startFocus(db,item,minutes,Date.now());if(save()){goView('focus');renderLifeFocus()}}catch(e){toast(e.message)}
}
function lifePauseToggle(){if(!lifeState().focus)return;if(lifeState().focus.state==='running')PulseLife.pauseFocus(db,Date.now());else PulseLife.resumeFocus(db,Date.now());if(save())renderLifeFocus()}
function lifeAddFocus(n){const f=lifeState().focus;if(!f)return;f.remaining=PulseLife.remaining(f,Date.now())+n*60;f.total+=n*60;if(f.state==='running')f.endsAt=Date.now()+f.remaining*1000;save();lifeTick()}
function lifeRememberResume(text){const f=lifeState().focus;if(f){f.resume=text;save()}}
function lifeFinishFocus(complete){
 const f=lifeState().focus;if(!f)return;
 if(complete&&f.id&&PulseLife.get(db,f.id)?.kind==='task'&&PulseLife.get(db,f.id).status!=='done'){if(!lifeMutate(()=>PulseLife.toggle(db,f.id,new Date().toISOString(),key(),uid('life')),'Aufgabe erledigt'))return}
 if(f.id&&f.resume&&PulseLife.get(db,f.id))PulseLife.update(db,f.id,{resume:f.resume},new Date().toISOString());
 lifeState().focus=null;if(save()){renderLifeFocus();toast('Timer beendet')}
}
function lifeSnapshots(){return {items:PulseLife.clone(lifeState().items),inbox:PulseLife.clone(db.inbox),tasks:PulseLife.clone(db.tasks),events:PulseLife.clone(db.events)}}
function lifeArray(name){return name==='items'?lifeState().items:db[name]}
function lifeMutate(fn,message='Gespeichert'){
 const before=lifeSnapshots();
 try{fn()}catch(e){for(const [k,v] of Object.entries(before)){if(k==='items')lifeState().items=v;else db[k]=v}toast(e.message);return false}
 const changes=[];
 for(const name of Object.keys(before)){const old=before[name],after=lifeArray(name)||[],byId=new Map(old.map((x,i)=>[String(x.id??i),i]));after.forEach((r,index)=>{const at=byId.has(String(r.id??index))?byId.get(String(r.id??index)):-1,prior=at<0?null:old[at],json=JSON.stringify(r);if(JSON.stringify(prior)!==json)changes.push({name,id:r.id??index,before:prior,afterHash:lifeHash(json),index:at})})}
 if(changes.length)pushUndo({type:'life',changes});
 if(!save())return false;
 renderLife();toast(message,changes.length?'Rückgängig':'');return true;
}
/* Short fingerprint of a record, so undo entries need not store full copies. */
function lifeHash(s){let h=2166136261;for(let i=0;i<s.length;i++){h^=s.charCodeAt(i);h=Math.imul(h,16777619)}return (h>>>0).toString(36)+':'+s.length}
function undoLife(action){
 const index=name=>{const arr=lifeArray(name)||[];return new Map(arr.map((x,i)=>[String(x.id??i),i]))},maps={};
 for(const c of action.changes){const arr=lifeArray(c.name)||[],m=maps[c.name]||(maps[c.name]=index(c.name)),i=m.get(String(c.id)),r=i==null?undefined:arr[i];const same=c.afterHash?r!==undefined&&lifeHash(JSON.stringify(r))===c.afterHash:JSON.stringify(r)===JSON.stringify(c.after);if(!same)return toast('Dieser Eintrag wurde inzwischen geändert. Bitte direkt bearbeiten.')}
 const groups={};for(const c of action.changes)(groups[c.name]=groups[c.name]||[]).push(c);
 for(const [name,list] of Object.entries(groups)){const drop=new Set(),put=new Map();for(const c of list){if(c.before===null)drop.add(String(c.id));else put.set(String(c.id),c.before)}
  const next=(lifeArray(name)||[]).map((x,i)=>[x,String(x.id??i)]).filter(([,k])=>!drop.has(k)).map(([x,k])=>put.has(k)?put.get(k):x);
  if(name==='items')lifeState().items=next;else db[name]=next}
 if(save()){renderLife();toast('Änderung zurückgenommen')}
}
function lifeToggle(id){const was=PulseLife.get(db,id)?.status;if(was!=='done'){lifeJustDone=id;lifeJustDoneAt=Date.now();pulseTap()}if(lifeMutate(()=>PulseLife.toggle(db,id,new Date().toISOString(),key(),uid('life')),'Aufgabe aktualisiert')&&was!=='done')pulseCelebrate()}
function lifeStatus(id,status){if(lifeMutate(()=>PulseLife.update(db,id,{status},new Date().toISOString()),status==='parked'?'Geparkt':'Aktualisiert'))lifeOpenItem(id)}
function lifePlanTomorrow(id){if(lifeMutate(()=>PulseLife.update(db,id,{date:PulseLife.offset(key(),1),time:'',status:'open'},new Date().toISOString()),'Für morgen eingeplant'))lifeReview()}
function lifeReview(){
 const items=PulseLife.list(db).filter(x=>x.kind==='task'&&!['done','parked'].includes(x.status)&&((x.date&&x.date<key())||(x.deadline&&x.deadline<key())));
 document.getElementById('lifeForm').hidden=true;const detail=document.getElementById('lifeDetail');detail.hidden=false;detail.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Überfällig</h2><p class="life-detail-intro">Auf morgen legen oder parken. Fristen bleiben bestehen.</p>'+
 (items.length?items.map(x=>lifeCard(x,{compact:true})+'<div class="life-review-actions">'+lifeButton('Morgen',lifeCall('lifePlanTomorrow',x.id),'life-btn')+lifeButton('Parken',lifeCall('lifeParkReview',x.id),'life-textbtn')+'</div>').join(''):lifeEmpty('Nichts überfällig.',''));
 openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
}
function lifeParkReview(id){if(lifeMutate(()=>PulseLife.update(db,id,{status:'parked'},new Date().toISOString()),'Geparkt'))lifeReview()}
function lifeOpenItem(id,raw=false){
 const x=PulseLife.get(db,id);if(!x)return;
 if(x.kind==='event'&&!raw)return calOpen(id,lifeSelectedDay&&PulseRecur.occursOn(x,lifeSelectedDay)?lifeSelectedDay:x.date);
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;const r=PulseLife.room(x.room),source=PulseLife.get(db,x.source),parent=PulseLife.get(db,x.parent);
 const children=PulseLife.list(db).filter(y=>y.parent===id||y.source===id);
 el.innerHTML='<div class="life-detail-mark '+r.color+'">'+lifeGlyph(r.symbol)+'</div><div class="life-detail-tags">'+lifePill(PulseLife.KINDS[x.kind])+lifePill(r.name)+'</div><h2 id="lifeDetailHeading" tabindex="-1">'+esc(x.title)+'</h2>'+
 (x.date?'<p class="life-detail-date">'+esc(lifeDate(x.date)+(x.time?' · '+x.time:''))+' · '+x.duration+' Min. geplant</p>':'')+
 (x.deadline?'<p class="life-deadline">Verbindliche Frist: '+esc(lifeDate(x.deadline))+'</p>':'')+
 (parent?'<button type="button" class="life-source" onclick="'+lifeCall('lifeOpenItem',parent.id)+'">Teil von: '+esc(parent.title)+' ↗</button>':'')+
 (source?'<button type="button" class="life-source" onclick="'+lifeCall('lifeOpenItem',source.id)+'">Entstanden aus: '+esc(source.title)+' ↗</button>':'')+
 '<div class="life-prose">'+esc(x.body||'')+'</div>'+(x.photos?.length?'<div class="life-photo-grid">'+photoTiles(x.photos)+'</div>':'')+
 (itemVideo(x)?videoCard(itemVideo(x),x.title):'')+(x.url&&!PulseVideo.parse(x.url)?'<a class="life-source" href="'+esc(x.url)+'" target="_blank" rel="noopener noreferrer">Quelle öffnen ↗</a>':'')+
 (x.steps.length?'<div class="life-steps"><h3>'+(x.kind==='recipe'?'Zutaten':'Schritte')+'</h3>'+x.steps.map((s,i)=>'<label><input type="checkbox" '+(s.done?'checked':'')+' onchange="'+lifeCall('lifeToggleStep',id,i)+'"/><span>'+esc(s.text)+'</span></label>').join('')+'</div>':'')+
 (x.resume?'<div class="life-resume-card"><b>Notiz zum Weitermachen</b><p>'+esc(x.resume)+'</p></div>':'')+
 '<div class="life-detail-actions">'+lifeButton('Bearbeiten',lifeCall('lifeEdit',id),'life-btn')+
 (['task','ritual'].includes(x.kind)?lifeButton('Fokus-Timer starten',lifeCall('lifeBeginFocus',id,x.duration),'life-btn dark'):'')+
 (x.kind==='task'?lifeButton(x.status==='done'?'Wieder öffnen':'Erledigt',lifeCall('lifeToggleDetail',id),'life-btn dark'):'')+
 (['note','project'].includes(x.kind)?lifeButton('Nächster Schritt',lifeCall('lifeDerive',id,'task'),'life-btn dark'):'')+
 (x.kind==='project'?lifeButton('Notiz dazu',lifeCall('lifeDerive',id,'note'),'life-btn'):'')+
 (x.kind==='recipe'?lifeButton('Einkaufsliste erstellen',lifeCall('lifeShopping',id),'life-btn dark'):'')+
 (x.kind==='ritual'?lifeButton('Erfahrung festhalten',lifeCall('lifeDerive',id,'note'),'life-btn'):'')+'</div>'+
 (['task','event'].includes(x.kind)?'<div class="life-statusline">'+lifePill({done:'Erledigt',open:'Offen',waiting:'Warte auf …',parked:'Geparkt'}[x.status]||'Offen')+(x.kind==='task'?lifeButton(x.status==='waiting'?'Nicht mehr warten':'Warte auf …',lifeCall('lifeStatus',id,x.status==='waiting'?'open':'waiting'),'life-textbtn')+lifeButton(x.status==='parked'?'Wieder aufnehmen':'Parken',lifeCall('lifeStatus',id,x.status==='parked'?'open':'parked'),'life-textbtn'):'')+'</div>':'')+
 (children.length?'<div class="life-sectionhead"><h3>Verbunden</h3></div>'+children.map(y=>lifeCard(y,{compact:true})).join(''):'')+
 '<div class="life-detail-bottom">'+(x.status==='archived'?lifeButton('Aus dem Archiv zurückholen',lifeCall('lifeStatus',id,'open'),'life-textbtn'):lifeButton('Archivieren',lifeCall('lifeArchive',id),'life-textbtn'))+'</div>';
 openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');PulsePhotos.hydrate(el);
}
function lifeToggleDetail(id){lifeToggle(id);lifeOpenItem(id)}
function lifeToggleStep(id,index){const x=PulseLife.get(db,id);if(!x?.steps[index])return;const steps=PulseLife.clone(x.steps);steps[index].done=!steps[index].done;if(lifeMutate(()=>PulseLife.update(db,id,{steps},new Date().toISOString()),'Schritt aktualisiert'))lifeOpenItem(id)}
function lifeArchive(id){if(lifeMutate(()=>PulseLife.update(db,id,{status:'archived'},new Date().toISOString()),'Archiviert · rückgängig möglich'))lifeCloseSheet()}
function lifeDerive(id,kind){
 const x=PulseLife.get(db,id);if(!x)return;
 lifeCompose({kind,room:x.room,parent:x.kind==='project'?id:x.parent,source:id,title:'',body:kind==='note'&&x.kind==='ritual'?'Was habe ich erlebt?\n\nWas möchte ich mitnehmen?\n':''});
}
function lifeShopping(id){
 const x=PulseLife.get(db,id);if(!x)return;
 lifeCompose({kind:'task',room:'koerper',source:id,title:'Einkaufen für '+x.title,body:'Aus deinem Rezept. Prüfe, was schon da ist.',steps:x.steps.map(s=>({text:s.text,done:false})),duration:20});
}
function lifeCompose(fields={}){
 const draft=lifeState().draft;
 if(draft){lifeFillEditor(draft);toast('Entwurf wiederhergestellt');return}
 lifeFillEditor({id:uid('life'),kind:'note',room:document.getElementById('appMain').dataset.view==='spaces'&&lifeCurrentRoom?lifeCurrentRoom:'alltag',title:'',body:'',date:'',time:'',deadline:'',duration:25,parent:'',source:'',steps:[],url:'',repeat:0,...fields});
}
function lifeEdit(id){const x=PulseLife.get(db,id);if(!x)return;if(x.kind==='event')return calEdit(id);if(lifeState().draft){lifeFillEditor(lifeState().draft);toast('Erst den offenen Entwurf speichern oder verwerfen.');return}lifeFillEditor(x)}
function lifeFillEditor(x){
 lifeEditingId=x.id||uid('life');lifeEditorPhotos=Array.isArray(x.photos)?[...x.photos]:[];renderEditorPhotos();document.getElementById('lifeDetail').hidden=true;document.getElementById('lifeForm').hidden=false;
 const map={lifeTitle:'title',lifeBody:'body',lifeDateInput:'date',lifeTimeInput:'time',lifeDeadline:'deadline',lifeDuration:'duration',lifeSource:'source',lifeUrl:'url',lifeRepeat:'repeat'};
 for(const [id,keyName] of Object.entries(map))document.getElementById(id).value=x[keyName]??'';
 document.getElementById('lifeRoomInput').innerHTML=PulseLife.ROOMS.map(r=>'<option value="'+r.id+'">'+r.name+'</option>').join('');
 document.getElementById('lifeRoomInput').value=x.room||'alltag';
 document.getElementById('lifeKindInput').value=x.kind||'note';
 document.getElementById('lifeKindInput').disabled=!!PulseLife.get(db,lifeEditingId);
 document.getElementById('lifeParent').innerHTML='<option value="">Kein Projekt</option>'+PulseLife.list(db).filter(y=>y.kind==='project'&&y.id!==lifeEditingId).map(y=>'<option value="'+esc(y.id)+'">'+esc(y.title)+'</option>').join('');
 document.getElementById('lifeParent').value=x.parent||'';
 document.getElementById('lifeStepsInput').value=(x.steps||[]).map(s=>s.text).join('\n');
 document.getElementById('lifeEditorHint').textContent=x.hint||'';
 document.getElementById('lifeEditorTitle').textContent=PulseLife.get(db,lifeEditingId)?'Bearbeiten':'Neuer Eintrag';
 document.getElementById('lifeDraftState').textContent=lifeState().draft?'Entwurf wiederhergestellt':'Noch nicht gespeichert';
 lifeKindChanged(false);
 openDialog(document.getElementById('lifeSheet'),'#lifeTitle');lifeUnderstand();
}
function lifeReadForm(){
 const ids={title:'lifeTitle',body:'lifeBody',kind:'lifeKindInput',room:'lifeRoomInput',date:'lifeDateInput',time:'lifeTimeInput',deadline:'lifeDeadline',duration:'lifeDuration',parent:'lifeParent',source:'lifeSource',url:'lifeUrl',repeat:'lifeRepeat'};
 const x={id:lifeEditingId};for(const [field,id] of Object.entries(ids))x[field]=document.getElementById(id).value;
 const old=PulseLife.get(db,lifeEditingId);
 x.steps=document.getElementById('lifeStepsInput').value.split('\n').map(t=>t.trim()).filter(Boolean).map(text=>({text,done:!!old?.steps.find(s=>s.text===text)?.done}));
 x.photos=[...lifeEditorPhotos];
 return x;
}
function lifeKindChanged(remember=true){const k=document.getElementById('lifeKindInput').value;document.getElementById('lifeStepsLabel').textContent=k==='recipe'?'Zutaten · eine pro Zeile':'Schritte · einer pro Zeile';document.getElementById('lifeRepeatLabel').hidden=k!=='task';document.getElementById('lifePlanning').open=k==='event';if(remember)lifeRememberDraft()}
function lifeRememberDraft(){if(document.getElementById('lifeForm').hidden||activeDialog!=='lifeSheet')return;lifeState().draft=lifeReadForm();const ok=save();document.getElementById('lifeDraftState').textContent=ok?'Entwurf gesichert':'Entwurf noch nicht gespeichert'}
function lifeSaveEntry(event){
 event?.preventDefault();const x=lifeReadForm(),oldDraft=lifeState().draft;
 const ok=lifeMutate(()=>{if(PulseLife.get(db,x.id))PulseLife.update(db,x.id,x,new Date().toISOString());else PulseLife.create(db,x,x.id,new Date().toISOString());lifeState().draft=null},'Gespeichert');
 if(ok){lifeCloseSheet();lifeEditingId=null}else lifeState().draft=oldDraft||x;
}
function lifeDiscardDraft(){lifeState().draft=null;lifeEditorPhotos=[];if(save()){lifeCloseSheet();toast('Entwurf verworfen');PulsePhotos.collect(photoReferences()).catch(()=>{})}}
function lifeCloseSheet(){closeDialog(document.getElementById('lifeSheet'))}
function lifeLegacy(v){goView(v);if(v==='workout')showWorkout(activePlan()||'A')}
function lifeSettings(){
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Einstellungen</h2><p class="life-detail-intro">PULSE 29</p><label class="life-name-field">Dein Name für die Begrüßung<input id="lifeNameInput" maxlength="40" autocomplete="given-name" value="'+esc(db.settings.name||'')+'" onchange="lifeSetName(this.value)"/></label><div class="life-settings-row"><div><b>Ruhige Ansicht</b><p>Weniger Farbe, keine Animationen.</p></div>'+lifeButton(lifeState().preferences.calm?'An':'Aus',lifeCall('lifeCalm'),'life-btn')+'</div>'+themeSettingsHTML()+videoSettingsHTML()+'<div class="life-sectionhead"><h3>Als App</h3></div><div class="life-settings-row"><div><b id="lifeStorageState">Speicherstatus wird geprüft …</b><p>'+(isStandalone()?'PULSE läuft als installierte App.':'Installiert bleibt PULSE offline nutzbar, und der Browser löscht deine Daten nicht beim Aufräumen.')+'</p></div>'+(deferredInstallPrompt&&!isStandalone()?lifeButton('Installieren',lifeCall('installPulse'),'life-btn dark'):'')+'</div>'+backupSettingsHTML()+'<div class="life-sectionhead"><h3>Weitere Werkzeuge</h3></div>'+lifeButton('Dein Himmel ↗','lifeCloseSheet();lifeOpenSky()','life-textbtn')+lifeButton('Ziele, Verlauf, Muster ↗',lifeCall('lifeLegacy','mehub'),'life-textbtn')+'<p class="life-footnote">Alles bleibt auf diesem Gerät. Spracheingabe nutzt den Spracherkennungsdienst von Chrome. Sync zwischen Geräten und Widgets gibt es noch nicht. '+(backupAgeDays()===null?'Noch kein Backup gesichert.':'Letztes Backup vor '+backupAgeDays()+' Tagen.')+'</p>';
 openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
 (navigator.storage?.persisted?navigator.storage.persisted():Promise.resolve(false)).then(p=>{const e=document.getElementById('lifeStorageState');if(e)e.textContent=p?'Speicher: dauerhaft geschützt':'Speicher: nicht dauerhaft geschützt'}).catch(()=>{});
}
function lifeSetName(v){db.settings.name=String(v||'').trim().slice(0,40);if(save()){renderLife();toast(db.settings.name?'Hallo, '+db.settings.name:'Name entfernt')}}
function lifeCalm(){lifeState().preferences.calm=!lifeState().preferences.calm;if(save()){renderLife();lifeSettings()}}
function renderLife(){
 if(!document.getElementById('lifeTodayContent'))return;
 const view=document.getElementById('appMain').dataset.view||'life';
 if(lifeRenderedDate&&lifeRenderedDate!==key()&&lifeSelectedDay===lifeRenderedDate)lifeSelectedDay=key();lifeRenderedDate=key();
 document.body.classList.toggle('life-calm',!!lifeState().preferences.calm);applyTheme();
 document.querySelectorAll('#lifeNav [data-life-view]').forEach(b=>{const active=b.dataset.lifeView===libTab(view);b.setAttribute('aria-current',active?'page':'false')});
 /* Only the visible screen is rendered; every navigation renders its target anew. */
 const R={life:renderLifeToday,spaces:renderLifeSpaces,library:()=>{if(document.activeElement?.id!=='lifeSearch')renderLifeLibrary()},focus:renderLifeFocus,calendar:renderCosmos,videos:renderVault,sigils:renderSigils,sky:renderSky,songs:renderSongs,more:renderMore,bodyhub:renderBodyHub,stapel:renderStapel,raum:renderRaum};
 (R[view]||(()=>{}))();clearTimeout(window.skyTimer);window.skyTimer=setTimeout(skyCheck,600);
 const nm=(db.settings.name||'').trim();document.querySelectorAll('[data-me-name]').forEach(e=>e.textContent=nm||'Du');document.querySelectorAll('[data-me-initial]').forEach(e=>e.textContent=nm?nm[0].toUpperCase():'·');
}
function lifeNavigation(v){
 const modern=['life','spaces','library','focus','calendar','videos','sigils','sky','songs','more','bodyhub','stapel','raum'].includes(v);
 document.body.classList.toggle('life-modern',modern);
 document.body.classList.toggle('life-legacy',!modern);
 renderLife();
}
document.addEventListener('keydown',event=>{
 if(!db)return;
 if(event.key==='Escape'&&activeDialog==='lifeSheet'){event.preventDefault();lifeCloseSheet()}
 if((event.ctrlKey||event.metaKey)&&event.key.toLowerCase()==='k'){event.preventDefault();lifeOpenLibrary()}
});
setInterval(lifeTick,1000);


// Old entry links must lead into the current application shell.
function lifeStartView(hash){
 const requested=String(hash||'').replace(/^#/,''),aliases={now:'life',brain:'library'};
 return aliases[requested]||(Object.hasOwn(VIEW_TITLES,requested)?requested:'life');
}


