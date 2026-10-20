// SOURCE: ui/library.js
/* Content surfaces: room library, today strip, tarot. Reading never writes; adopting does. */
const LIB_GROUP_LIMIT=4;
function libTab(view){return ['bodyhub','workout','nutrition','recovery','trends'].includes(view)?'bodyhub':['life','spaces','library','focus'].includes(view)?view:'spaces'}
function libAdopted(id){return PulseLife.list(db).find(x=>x.source==='lib:'+id)||null}
function libCard(e){
 const r=PulseLife.room(e.room),mine=libAdopted(e.id);
 return '<button type="button" class="life-lib-card" onclick="'+lifeCall('lifeOpenLib',e.id)+'"><span class="life-lib-type '+r.color+'">'+esc(PulseLibrary.TYPES[e.type])+(mine?' · gesammelt':'')+'</span><b>'+esc(e.title)+'</b><small>'+esc(e.sub)+'</small></button>';
}
function libGroups(entries){
 const order=['recipe','list','practice','prompt','knowledge','read'],names={recipe:'Rezepte',list:'Listen',practice:'Übungen',prompt:'Impulse',knowledge:'Wissen',read:'Lesestoff & Orte'};
 return order.map(t=>{const list=entries.filter(e=>e.type===t);if(!list.length)return '';
  const head='<h3 class="life-lib-grouphead">'+names[t]+' <span>'+list.length+'</span></h3>';
  const first='<div class="life-lib-grid">'+list.slice(0,LIB_GROUP_LIMIT).map(libCard).join('')+'</div>';
  const rest=list.length>LIB_GROUP_LIMIT?'<details class="life-lib-more"><summary>Alle '+list.length+' zeigen</summary><div class="life-lib-grid">'+list.slice(LIB_GROUP_LIMIT).map(libCard).join('')+'</div></details>':'';
  return head+first+rest}).join('');
}
function moonSvg(m,size=44){
 const r=18,c=22,p=m.age/29.530588853,k=Math.cos(2*Math.PI*p),rx=Math.abs(k)*r,waxing=p<.5;
 const outer=waxing?1:0,inner=waxing?(k>0?0:1):(k>0?1:0);
 const lit=m.illumination<=1?'':'<path d="M'+c+' '+(c-r)+'A'+r+' '+r+' 0 0 '+outer+' '+c+' '+(c+r)+'A'+rx.toFixed(2)+' '+r+' 0 0 '+inner+' '+c+' '+(c-r)+'Z" fill="#F5E6B3"/>';
 return '<svg class="life-moon" width="'+size+'" height="'+size+'" viewBox="0 0 44 44" aria-hidden="true"><circle cx="22" cy="22" r="18" fill="#0c0a24"/>'+(m.illumination>=99?'<circle cx="22" cy="22" r="18" fill="#F5E6B3"/>':lit)+'<circle cx="22" cy="22" r="18" fill="none" stroke="rgb(255 255 255/.25)" stroke-width="1"/></svg>';
}
function moonLine(m){return m.index===4?'Heute Vollmond':m.index===0?'Heute Neumond':m.waxing?'Vollmond in '+m.daysToFull+' '+(m.daysToFull===1?'Tag':'Tagen'):'Neumond in '+m.daysToNew+' '+(m.daysToNew===1?'Tag':'Tagen')}
function libTodayCard(){const t=lifeState().preferences.tarot;return t&&t.date===key()&&Number.isInteger(t.index)&&t.index>=0&&t.index<78?{...t,card:PulseLibrary.TAROT[t.index]}:null}
function lifeTodayStrip(date){
 const m=PulseLibrary.moon(date),recipe=PulseLibrary.daily(date,'recipe','koerper'),prompt=PulseLibrary.daily(date,'prompt','innen'),isToday=date===key(),card=isToday?libTodayCard():null;
 const tarot=!isToday?'':card
  ?'<button type="button" class="life-tonight-card picked" onclick="'+lifeCall('lifeTarotOpen',card.index)+'"><span class="life-mini-card">'+lifeGlyph('star')+'</span><b>'+esc(card.card.name)+'</b><small>Deine Tageskarte</small></button>'
  :'<div class="life-tonight-card"><span class="life-mini-card back"></span><span class="life-today-actions">'+lifeButton('Karte ziehen',lifeCall('lifeDrawCard'),'life-textbtn')+lifeButton('Aus meinem Deck',lifeCall('lifeTarotBrowse','major',true),'life-textbtn')+'</span></div>';
 const row=(e,color,glyph,label)=>e?'<button type="button" class="life-today-row" onclick="'+lifeCall('lifeOpenLib',e.id)+'"><span class="'+color+'">'+lifeGlyph(glyph)+'</span><span class="grow"><b>'+esc(e.title)+'</b><small>'+esc(label)+'</small></span><i aria-hidden="true">›</i></button>':'';
 return '<section class="life-tonight" aria-label="Mond und Tageskarte"><button type="button" class="life-tonight-moon" onclick="'+lifeCall('lifeOpenSpaces','sinn')+'">'+moonSvg(m,56)+'<span><span class="life-kicker">Mond · '+m.illumination+' %</span><b>'+esc(m.name)+'</b><small>'+esc(moonLine(m))+'</small></span></button>'+tarot+'</section>'+
  '<div class="life-today-list">'+row(recipe,'green','leaf','Rezeptidee · '+(recipe?recipe.sub.split(' · ')[0]:''))+row(prompt,'lilac','wave','Schreibimpuls')+'</div>';
}
function lifeLibSection(roomId){
 const entries=PulseLibrary.forRoom(roomId);let widgets='';
 if(roomId==='sinn'){
  const m=PulseLibrary.moon(key()),card=libTodayCard();
  widgets='<div class="life-lib-widgets"><div class="life-moon-panel">'+moonSvg(m,64)+'<div><span class="life-kicker">Mond heute · '+m.illumination+' % beleuchtet</span><b>'+esc(m.name)+'</b><p>'+esc(m.impulse)+'</p><small>'+esc(moonLine(m))+'</small></div></div>'+
  '<div class="life-tarot-panel"><span class="life-kicker">Tarot</span>'+(card?'<b>Heute: '+esc(card.card.name)+'</b><p>'+esc(card.card.question)+'</p>'+lifeButton('Karte ansehen',lifeCall('lifeTarotOpen',card.index),'life-btn'):'<b>Deine Tageskarte</b><p>Ziehe digital – oder trag die Karte ein, die du aus deinem Deck gezogen hast.</p><div class="life-room-actions">'+lifeButton('Digital ziehen',lifeCall('lifeDrawCard'),'life-btn dark')+lifeButton('Aus meinem Deck',lifeCall('lifeTarotBrowse','major',true),'life-btn')+'</div>')+
  (()=>{const st=tarotStats();return '<div class="life-tarot-stats"><b>'+st.days+'</b><span>'+(st.days===1?'Tageskarte':'Tageskarten')+(st.top?' · am häufigsten '+esc(st.top.card.name)+' ('+st.top.n+'×)':'')+'</span>'+(st.days?lifeButton('Verlauf',lifeCall('lifeTarotHistory'),'life-textbtn'):'')+'</div>'})()+
  '<div class="life-room-actions">'+lifeButton('Drei Karten legen',lifeCall('lifeSpread','drei'),'life-btn')+lifeButton('Entscheidung legen',lifeCall('lifeSpread','kreuz'),'life-btn')+'</div>'+
  '<div class="life-tarot-links">'+[['major','Große Arkana'],['staebe','Stäbe'],['kelche','Kelche'],['schwerter','Schwerter'],['pentakel','Pentakel']].map(([f,l])=>lifeButton(l,lifeCall('lifeTarotBrowse',f,false),'life-tool-link')).join('')+'</div></div></div>';
 }
 if(roomId==='draussen'){const s=PulseLibrary.seasonal(key());widgets='<div class="life-season"><span class="life-kicker">Jetzt im '+s.name+'</span><ul>'+s.ideas.map(i=>'<li>'+esc(i)+'</li>').join('')+'</ul></div>'}
 return '<div class="life-sectionhead"><h2>Schon da</h2><span class="life-subtle">'+entries.length+' Inhalte · lesen oder übernehmen</span></div>'+widgets+libGroups(entries);
}
function libDetailShell(html){document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;el.innerHTML=html;openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');el.closest('.life-sheet-panel')?.scrollTo?.(0,0)}
function lifeOpenLib(id){
 const e=PulseLibrary.get(id);if(!e)return;const r=PulseLife.room(e.room),mine=libAdopted(id);
 const steps=e.steps.length?'<div class="life-steps"><h3>'+(e.type==='recipe'?'Zutaten':'Schritte')+'</h3><ul class="life-lib-steps">'+e.steps.map(s=>'<li>'+esc(s)+'</li>').join('')+'</ul></div>':'';
 const primary=e.type==='prompt'?lifeButton('Jetzt dazu schreiben',lifeCall('lifeLibWrite',id),'life-btn dark'):mine?lifeButton('In deiner Sammlung öffnen',lifeCall('lifeOpenItem',mine.id),'life-btn dark'):lifeButton('In meine Sammlung',lifeCall('lifeAdoptLib',id),'life-btn dark');
 libDetailShell('<div class="life-detail-mark '+r.color+'">'+lifeGlyph(r.symbol)+'</div><div class="life-detail-tags">'+lifePill(PulseLibrary.TYPES[e.type])+lifePill(r.name)+lifePill('Aus der Bibliothek')+'</div><h2 id="lifeDetailHeading" tabindex="-1">'+esc(e.title)+'</h2><p class="life-detail-date">'+esc(e.sub)+'</p>'+steps+'<div class="life-prose">'+esc(e.body)+'</div><div class="life-detail-actions">'+primary+
  (e.type==='recipe'?lifeButton('Einkaufsliste',lifeCall('lifeLibShopping',id),'life-btn'):'')+
  (e.type==='practice'?lifeButton('Zeit dafür nehmen',lifeCall('lifeLibFocus',id),'life-btn'):'')+
  (e.type==='recipe'?lifeButton('Einplanen',lifeCall('lifeLibPlan',id),'life-btn'):'')+
  '</div><p class="life-footnote">Bibliotheksinhalte gehören zur App. Was du übernimmst, gehört dir und lässt sich frei bearbeiten.</p>');
}
function libFields(e){
 const base={room:e.room,title:e.title,source:'lib:'+e.id};
 if(e.type==='recipe')return {...base,kind:'recipe',body:e.sub+'\n\n'+e.body,steps:e.steps.map(text=>({text,done:false}))};
 if(e.type==='list')return {...base,kind:'task',body:e.body,steps:e.steps.map(text=>({text,done:false})),duration:20};
 if(e.type==='practice')return {...base,kind:'ritual',body:e.body,duration:10};
 if(e.type==='read')return {...base,kind:'note',body:e.sub+'\n\n'+e.body+'\n\nMeine Gedanken:\n'};
 return {...base,kind:'note',body:e.body};
}
function lifeAdoptLib(id){
 const e=PulseLibrary.get(id);if(!e)return;const existing=libAdopted(id);if(existing)return lifeOpenItem(existing.id);
 const newId=uid('life');if(lifeMutate(()=>PulseLife.create(db,libFields(e),newId,new Date().toISOString()),'In deiner Sammlung'))lifeOpenItem(newId);
}
function lifeLibWrite(id){const e=PulseLibrary.get(id);if(e)lifeCompose({kind:'note',room:e.room,title:'',body:e.title+'\n\n',source:'lib:'+id})}
function lifeLibShopping(id){const e=PulseLibrary.get(id);if(e)lifeCompose({kind:'task',room:'koerper',title:'Einkaufen: '+e.title,body:'Prüf vorher, was schon da ist.',steps:e.steps.map(text=>({text,done:false})),source:'lib:'+id,duration:20})}
function lifeLibPlan(id){const e=PulseLibrary.get(id);if(e)lifeCompose({kind:'task',room:'koerper',title:'Kochen: '+e.title,body:e.sub+'\n\n'+e.body,steps:e.steps.map(text=>({text,done:false})),date:key(),source:'lib:'+id,duration:30})}
function lifeLibFocus(id){
 const e=PulseLibrary.get(id);if(!e)return;
 if(lifeState().focus){lifeCloseSheet();goView('focus');return toast('Dein bisheriger Moment wartet noch.')}
 PulseLife.startFocus(db,{id:'',title:e.title,resume:''},10,Date.now());if(save()){lifeCloseSheet();goView('focus')}
}
/* Tarot */
function lifeTarotBrowse(filter='major',pick=false){
 const cards=PulseLibrary.TAROT.filter(c=>filter==='major'?c.arcana==='major':c.suit===filter);
 const tabs=[['major','Große Arkana'],['staebe','Stäbe'],['kelche','Kelche'],['schwerter','Schwerter'],['pentakel','Pentakel']];
 libDetailShell('<span class="life-kicker">'+(pick?'Welche Karte hast du gezogen?':'Tarot · zum Nachschlagen')+'</span><h2 id="lifeDetailHeading" tabindex="-1">'+esc(tabs.find(t=>t[0]===filter)[1])+'</h2>'+(pick?'<p class="life-detail-intro">Tipp auf die Karte aus deinem Deck. Sie wird deine Tageskarte.</p>':'')+
  '<div class="life-filterbar">'+tabs.map(([f,l])=>'<button type="button" aria-pressed="'+(f===filter)+'" onclick="'+lifeCall('lifeTarotBrowse',f,pick)+'">'+l+'</button>').join('')+'</div>'+
  (filter!=='major'?'<p class="life-footnote">'+esc((s=>s.name+' · '+s.element+' · '+s.theme)(PulseLibrary.SUITS.find(s=>s.id===filter)))+'</p>':'')+
  '<div class="life-tarot-list">'+cards.map(c=>'<button type="button" onclick="'+(pick?lifeCall('lifePickCard',c.index):lifeCall('lifeTarotOpen',c.index))+'"><span class="life-tarot-num">'+(c.arcana==='major'?toRoman(c.number):'')+'</span><span class="grow"><b>'+esc(c.name)+'</b><small>'+esc(c.wildUnknown?'Wild Unknown: '+c.wildUnknown:c.keywords.split(' – ')[0])+'</small></span><span aria-hidden="true">↗</span></button>').join('')+'</div>');
}
function toRoman(n){if(n===0)return '0';const v=[[10,'X'],[9,'IX'],[5,'V'],[4,'IV'],[1,'I']];let o='';for(const [k,s] of v)while(n>=k){o+=s;n-=k}return o}
function lifeTarotOpen(i){
 const c=PulseLibrary.TAROT[i];if(!c)return;const today=libTodayCard(),isToday=today?.index===i;
 libDetailShell('<div class="life-tarot-face">'+(c.arcana==='major'?'<span>'+toRoman(c.number)+'</span>':'<span>'+esc(c.element)+'</span>')+lifeGlyph('star')+'</div><div class="life-detail-tags">'+lifePill(c.arcana==='major'?'Große Arkana':'Kleine Arkana')+(isToday?lifePill('Deine Tageskarte'):'')+'</div><h2 id="lifeDetailHeading" tabindex="-1">'+esc(c.name)+'</h2>'+(c.wildUnknown?'<p class="life-detail-date">In The Wild Unknown: '+esc(c.wildUnknown)+'</p>':'')+
  '<div class="life-tarot-meaning"><h3>Bedeutung</h3><p>'+esc(c.keywords)+'</p><h3>Umgekehrt</h3><p>'+esc(c.reversed)+'</p><h3>Eine Frage dazu</h3><p class="life-tarot-q">'+esc(c.question)+'</p></div>'+
  '<label class="life-tarot-mine">Meine Bedeutung<textarea rows="3" placeholder="Was sagt dir diese Karte – in deinem Deck, mit deinen Worten?" oninput="'+lifeCall('lifeTarotNoteFrom',i)+'">'+esc(tarotPrefs().tarotNotes[i]||'')+'</textarea><small id="lifeTarotNoteState" aria-live="polite">'+((tarotStats().count[i]||0)?'Bisher '+tarotStats().count[i]+'× als Tageskarte':'Noch nie als Tageskarte gezogen')+'</small></label>'+
  '<div class="life-detail-actions">'+lifeButton('Notiz dazu schreiben',lifeCall('lifeTarotRecord',i),'life-btn dark')+(isToday?'':lifeButton('Als Tageskarte',lifeCall('lifePickCard',i),'life-btn'))+lifeButton(c.arcana==='major'?'Alle großen Arkana':'Alle '+PulseLibrary.SUITS.find(s=>s.id===c.suit).name,lifeCall('lifeTarotBrowse',c.arcana==='major'?'major':c.suit,false),'life-textbtn')+'</div><p class="life-footnote">Kurze Lesehilfen in eigenen Worten. Deine eigene Wahrnehmung des Bildes zählt mehr.</p>');
}
function lifeSetCard(index,source){
 const prefs=tarotPrefs(),previous=prefs.tarot,history=prefs.tarotHistory.slice();
 prefs.tarot={date:key(),index,source};prefs.tarotHistory=prefs.tarotHistory.filter(x=>x.date!==key()).concat({date:key(),index,source}).slice(-500);
 if(!save()){prefs.tarot=previous;prefs.tarotHistory=history;return false}renderLife();return true;
}
function lifeDrawCard(){
 if(libTodayCard()){lifeTarotOpen(libTodayCard().index);return}
 const a=new Uint32Array(1);(globalThis.crypto?.getRandomValues?crypto.getRandomValues(a):a[0]=Math.floor(Math.random()*2**32));
 const index=a[0]%78;if(lifeSetCard(index,'digital'))lifeTarotOpen(index);
}
function lifePickCard(i){if(lifeSetCard(i,'deck')){lifeTarotOpen(i);toast('Als Tageskarte gespeichert')}}
function lifeTarotRecord(i){
 const c=PulseLibrary.TAROT[i];if(!c)return;const t=libTodayCard(),daily=t?.index===i;
 lifeCompose({kind:'note',room:'sinn',title:(daily?'Tageskarte · ':'Tarot · ')+c.name,source:'tarot:'+i,
  body:lifeDate(key())+(daily?' · '+(t.source==='deck'?'aus meinem Deck gezogen':'digital gezogen'):'')+'\n'+c.name+(c.wildUnknown?' ('+c.wildUnknown+')':'')+'\n\nMein erster Eindruck vom Bild:\n\n\nBedeutung: '+c.keywords+'\nFrage: '+c.question+'\n\nWas sie heute für mich heißen könnte:\n'});
}
/* Collection search across own entries, library and tarot */
function libSearchHTML(q){
 const t=q.toLocaleLowerCase('de').trim(),notes=tarotPrefs().tarotNotes,lib=PulseLibrary.search(q),hit=new Set(PulseLibrary.searchTarot(q).map(c=>c.index));for(const [i,n] of Object.entries(notes))if(String(n).toLocaleLowerCase('de').includes(t))hit.add(Number(i));const cards=[...hit].slice(0,8).map(i=>PulseLibrary.TAROT[i]);
 if(!lib.length&&!cards.length)return '';
 return '<p class="life-result-count">Aus der Bibliothek · '+(lib.length+cards.length)+'</p><div class="life-lib-grid">'+lib.map(libCard).join('')+cards.map(c=>'<button type="button" class="life-lib-card" onclick="'+lifeCall('lifeTarotOpen',c.index)+'"><span class="life-lib-type plum-soft">Tarot</span><b>'+esc(c.name)+'</b><small>'+esc(c.keywords.split(' – ')[0])+'</small></button>').join('')+'</div>';
}


