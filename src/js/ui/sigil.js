// SOURCE: ui/sigil.js
/* Sigillen-Werkstatt: build, charge (full-screen gnosis with sound and timer), forget, record results. */
let sigilDraft={intent:'',method:'rad',style:'geschwungen',seed:null,vowels:false},sigilReady=false,sigilCharge=null;
const sigilNow=()=>new Date().toISOString();
function lifeOpenSigils(){goView('sigils');renderSigils()}
function sigilPrepare(){if(sigilReady||!db)return;sigilReady=true;PulseSigil.normalize(db)}
function sigilSeed(){return sigilDraft.seed??PulseSigil.hash(sigilDraft.intent)}
function sigilPreview(){
 const box=document.getElementById('sigilPreview');if(!box)return;
 const letters=PulseSigil.reduce(sigilDraft.intent,{vowels:sigilDraft.vowels});
 box.innerHTML=letters?PulseSigil.svg(letters,{method:sigilDraft.method,style:sigilDraft.style,seed:sigilSeed()},{cls:'sigil-svg'}):'<p class="sigil-empty">Hier erscheint deine Sigille.</p>';
 const l=document.getElementById('sigilLetters');if(l)l.textContent=letters?letters.split('').join(' '):'';
}
function sigilInput(v){sigilDraft.intent=v;sigilDraft.seed=null;sigilPreview()}
function sigilOpt(k,v){sigilDraft[k]=v;if(k!=='seed')renderSigils();else sigilPreview()}
function sigilReroll(){sigilDraft.seed=Math.floor(Math.random()*4294967295);sigilPreview();pulseTap(8)}
function sigilKeep(){
 const m=cosmosMoon(key());let s;
 try{s=PulseSigil.create(db,{intent:sigilDraft.intent,method:sigilDraft.method,style:sigilDraft.style,seed:sigilSeed(),phase:m.index,vowels:sigilDraft.vowels},sigilNow())}catch(e){return toast(e.message)}
 if(!save())return;sigilDraft={intent:'',method:sigilDraft.method,style:sigilDraft.style,seed:null,vowels:false};pulseSound('chime');pulseTap([12,50,12]);renderSigils();toast('Sigille '+sigilNo(s.no)+' erschaffen');skyCheck();sigilOpen(s.id);
}
const sigilNo=n=>'#'+String(n).padStart(2,'0');
const sigilGlyph=(s,cls='sigil-svg')=>PulseSigil.svg(s.letters,{method:s.method,style:s.style,seed:s.seed},{cls});
function sigilCard(s){
 const hidden=!!s.forgottenAt;
 return '<button type="button" class="sigil-card '+s.status+'" onclick="'+lifeCall('sigilOpen',s.id)+'" aria-label="'+esc('Sigille '+sigilNo(s.no)+', '+PulseSigil.LABEL[s.status]+(hidden?'':', '+s.intent))+'">'+sigilGlyph(s)+'<span class="sigil-meta"><b>'+sigilNo(s.no)+'</b><small>'+esc(PulseSigil.LABEL[s.status])+'</small></span>'+(hidden?'':'<span class="sigil-intent">'+esc(s.intent)+'</span>')+'</button>';
}
function renderSigils(){
 const host=document.getElementById('sigilContent');if(!host||document.getElementById('appMain').dataset.view!=='sigils')return;
 if(document.activeElement?.id==='sigilIntent')return sigilPreview();
 sigilPrepare();const m=cosmosMoon(key()),P=PulseLore.PHASES[m.index],list=[...PulseSigil.ensure(db).sigils].reverse();
 const seg=(k,opts)=>'<div class="life-seg" role="group">'+opts.map(([v,l])=>'<button type="button" aria-pressed="'+(sigilDraft[k]===v)+'" onclick="'+lifeCall('sigilOpt',k,v)+'">'+l+'</button>').join('')+'</div>';
 host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Chaos-Magie</span><h1>Sigillen</h1></header>'+
  '<div class="sigil-moon">'+moonSvg(m,40)+'<p><b>'+esc(m.name)+':</b> '+esc(P.title)+'. '+(m.index<=1?'Eine gute Zeit für neue Sigillen.':m.index>=5?'Eher auswerten und vergessen als neu beginnen.':'')+'</p></div>'+
  '<section class="sigil-workshop"><label class="life-name-field">Absicht<textarea id="sigilIntent" rows="2" maxlength="300" placeholder="Ich schlafe tief und ruhig." oninput="sigilInput(this.value)">'+esc(sigilDraft.intent)+'</textarea></label>'+
  '<p class="life-footnote">Kurz, positiv, in der Gegenwart. Pulse streicht Vokale und doppelte Buchstaben.</p>'+
  '<div class="sigil-stage"><div id="sigilPreview" class="sigil-preview"></div><p id="sigilLetters" class="sigil-letters" aria-live="polite"></p></div>'+
  '<div class="sigil-opts">'+seg('method',[['rad','Buchstabenrad'],['quadrat','Saturnquadrat']])+seg('style',[['geschwungen','Geschwungen'],['gerade','Gerade']])+'</div>'+
  '<div class="life-detail-actions">'+lifeButton('Neu würfeln','sigilReroll()','life-btn')+lifeButton('Sigille behalten','sigilKeep()','life-btn dark')+'</div></section>'+
  '<div class="life-sectionhead"><h2>Deine Sigillen</h2><span class="life-muted">'+list.length+'</span></div>'+
  (list.length?'<div class="sigil-grid">'+list.map(sigilCard).join('')+'</div>':'<p class="life-none">Noch keine. Die erste entsteht oben.</p>')+
  '<div class="cos-actions">'+lifeButton('Sigille nach Spare',lifeCall('lifeOpenLib','sinn-sigille-nach-spare'),'life-textbtn')+lifeButton('Gnosis',lifeCall('lifeOpenLib','sinn-gnosis'),'life-textbtn')+lifeButton('Magisches Tagebuch',lifeCall('lifeOpenLib','sinn-magisches-tagebuch'),'life-textbtn')+'</div>';
 sigilPreview();
}
function sigilOpen(id){
 const s=PulseSigil.ensure(db).sigils.find(x=>x.id===id);if(!s)return;
 const hidden=!!s.forgottenAt,moon=s.phase!=null?PulseLibrary.MOON_PHASES[s.phase][0]:'';
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 el.innerHTML='<div class="sigil-detail-glyph">'+sigilGlyph(s,'sigil-svg big')+'</div><h2 id="lifeDetailHeading" tabindex="-1">Sigille '+sigilNo(s.no)+'</h2>'+
  '<p class="vault-meta-line">'+esc(PulseSigil.LABEL[s.status])+' · erschaffen am '+esc(lifeDate(s.createdAt.slice(0,10),{day:'numeric',month:'long',year:'numeric'}))+(moon?' bei '+esc(moon):'')+(s.charges.length?' · '+s.charges.length+'× geladen':'')+'</p>'+
  (hidden?'<details class="sigil-secret"><summary>Absicht anzeigen</summary><p>'+esc(s.intent)+'</p></details>':'<p class="sigil-intent-big">„'+esc(s.intent)+'“</p>')+
  '<div class="life-detail-actions">'+lifeButton('Laden',lifeCall('sigilStart',s.id),'life-btn dark')+(hidden?'':lifeButton('Vergessen',lifeCall('sigilForget',s.id),'life-btn'))+lifeButton('Als Bild speichern',lifeCall('sigilDownload',s.id),'life-textbtn')+'</div>'+
  '<div class="vault-block"><h3>Ergebnis</h3>'+(s.result?'<p class="life-prose">'+esc(s.result.note||'Ohne Notiz')+'</p><p class="life-footnote">Zusammenhang '+s.result.score+' von 10 · '+esc(lifeDate(s.result.at.slice(0,10),{day:'numeric',month:'short'}))+'</p>':'<p class="life-footnote">Was ist passiert, und wann? Wie hoch schätzt du den Zusammenhang ein?</p>')+
  '<label class="srOnly" for="sigilResult">Was ist passiert?</label><textarea id="sigilResult" rows="3" placeholder="Was ist passiert?">'+esc(s.result?.note||'')+'</textarea><label class="sigil-score">Zusammenhang <output id="sigilScoreOut">'+(s.result?.score??5)+'</output> / 10<input id="sigilScore" type="range" min="0" max="10" step="1" value="'+(s.result?.score??5)+'" oninput="document.getElementById(\'sigilScoreOut\').textContent=this.value"/></label>'+lifeButton('Ergebnis speichern',lifeCall('sigilSaveResult',s.id),'life-btn')+'</div>'+
  '<div class="life-detail-actions">'+lifeButton('Sigille löschen',lifeCall('sigilDelete',s.id),'life-textbtn danger')+'</div>';
 if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
}
function sigilMutate(fn,msg){try{fn()}catch(e){return toast(e.message)}if(!save())return;renderSigils();if(msg)toast(msg);skyCheck()}
function sigilForget(id){sigilMutate(()=>PulseSigil.forget(db,id,sigilNow()),'Vergessen. Die Absicht ist jetzt verborgen.');sigilOpen(id)}
function sigilSaveResult(id){sigilMutate(()=>PulseSigil.result(db,id,document.getElementById('sigilResult').value,document.getElementById('sigilScore').value,sigilNow()),'Ergebnis gespeichert');sigilOpen(id)}
function sigilDelete(id){pushUndo({type:'magic',before:PulseLife.clone(db.magic)});sigilMutate(()=>PulseSigil.remove(db,id));lifeCloseSheet();toast('Sigille gelöscht','Rückgängig')}
function undoMagic(u){db.magic=u.before;PulseSigil.normalize(db);save();renderSigils();toast('Wiederhergestellt')}
function sigilDownload(id){
 const s=PulseSigil.ensure(db).sigils.find(x=>x.id===id);if(!s)return;
 const svg=PulseSigil.svg(s.letters,{method:s.method,style:s.style,seed:s.seed},{stroke:'#111',width:5}).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="1200" style="background:#fff" ');
 const img=new Image(),c=document.createElement('canvas');c.width=c.height=1200;
 img.onload=()=>{const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,1200,1200);g.drawImage(img,0,0,1200,1200);c.toBlob(b=>{const a=document.createElement('a'),u=URL.createObjectURL(b);a.href=u;a.download='Sigille_'+s.no+'.png';document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),2000)},'image/png')};
 img.src='data:image/svg+xml;charset=utf-8,'+encodeURIComponent(svg);
}
/* ---------- Charging: full screen ---------- */
async function sigilStart(id,minutes=3,mode='still'){
 const s=PulseSigil.ensure(db).sigils.find(x=>x.id===id);if(!s)return;
 let lock=null;if(sigilCharge&&!sigilCharge.done){clearInterval(sigilCharge.timer);lock=sigilCharge.lock}else{lifeCloseSheet();try{lock=await navigator.wakeLock?.request('screen')}catch(_){}}
 sigilCharge={id,mode,minutes,start:Date.now(),end:Date.now()+minutes*60000,lock,timer:null,done:false};
 let el=document.getElementById('sigilOverlay');if(!el){el=document.createElement('div');el.id='sigilOverlay';document.body.appendChild(el)}
 el.className='sigil-overlay '+mode;el.setAttribute('role','dialog');el.setAttribute('aria-modal','true');el.setAttribute('aria-label','Sigille laden');
 el.innerHTML='<div class="sigil-charge-glyph"><div class="sigil-breath" aria-hidden="true"></div>'+sigilGlyph(s,'sigil-svg charge')+'</div>'+
  '<div class="sigil-charge-ui"><span id="sigilClock" class="sigil-clock">'+lifeClock(minutes*60)+'</span><p id="sigilHint">'+(mode==='still'?'Atme mit dem Kreis. Schau auf die Sigille, bis der Kopf leer ist.':'Bewege dich, summe, werde laut. Im Höhepunkt: auf die Sigille schauen.')+'</p>'+
  '<div class="sigil-row">'+[1,3,5,9].map(n=>'<button type="button" aria-pressed="'+(n===minutes)+'" onclick="'+lifeCall('sigilStart',id,n,mode)+'">'+n+' Min.</button>').join('')+'</div>'+
  '<div class="sigil-row">'+[['still','Still'],['ekstatisch','Ekstatisch']].map(([k,l])=>'<button type="button" aria-pressed="'+(k===mode)+'" onclick="'+lifeCall('sigilStart',id,minutes,k)+'">'+l+'</button>').join('')+'</div>'+
  soundChips('Klang')+'<div class="sigil-row">'+lifeButton('Jetzt beenden','sigilEnd(true)','life-btn')+'</div></div>';
 if(!PulseSoundscape.playing())PulseSoundscape.play('drone');
 document.querySelectorAll('#sigilOverlay .sound-chips').forEach(x=>x.outerHTML=soundChips('Klang'));
 el.hidden=false;document.body.classList.add('sigil-open');el.querySelector('button')?.focus();
 sigilCharge.timer=setInterval(sigilTick,250);
}
function sigilTick(){if(!sigilCharge)return;const left=Math.max(0,Math.ceil((sigilCharge.end-Date.now())/1000));const c=document.getElementById('sigilClock');if(c)c.textContent=lifeClock(left);if(!left)sigilEnd(false)}
function sigilEnd(early){
 const c=sigilCharge;if(!c||c.done)return;c.done=true;clearInterval(c.timer);try{c.lock?.release()}catch(_){}
 const minutes=(Date.now()-c.start)/60000;
 if(minutes>=0.25){try{PulseSigil.charge(db,c.id,minutes,c.mode,sigilNow());save()}catch(_){}}
 PulseSoundscape.play('');pulseSound('chime');pulseTap([20,80,20,80,40]);
 const el=document.getElementById('sigilOverlay');if(!el)return;el.className='sigil-overlay after';
 el.innerHTML='<div class="sigil-after"><h2>'+(minutes>=0.25?'Geladen.':'Abgebrochen.')+'</h2><p>Jetzt bannen: Lach laut, auch wenn es sich albern anfühlt, bis es echt wird. Dann etwas ganz anderes tun.</p><div class="sigil-row">'+(minutes>=0.25?'<button type="button" onclick="'+lifeCall('sigilFinish',c.id,true)+'">Vergessen</button>':'')+'<button type="button" onclick="'+lifeCall('sigilFinish',c.id,false)+'">'+(minutes>=0.25?'Noch nicht vergessen':'Schließen')+'</button></div></div>';
 el.querySelector('button')?.focus();
}
function sigilFinish(id,forget){
 if(forget){try{PulseSigil.forget(db,id,sigilNow());save()}catch(_){}}
 const el=document.getElementById('sigilOverlay');if(el){el.hidden=true;el.innerHTML=''}document.body.classList.remove('sigil-open');sigilCharge=null;renderSigils();skyCheck();
 if(forget)toast('Vergessen. Lass sie arbeiten.');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape'&&sigilCharge){if(!sigilCharge.done)sigilEnd(true);else sigilFinish(sigilCharge.id,false)}});
