// SOURCE: ui/sky.js
/* "Dein Himmel": stars for achievements (they stay lit), a 90-day glow map and the tarot collection.
   Plus the "Gestern" line on the Tag screen and the cut-up machine. */
const skyPhase=d=>cosmosMoon(d).index;
function skyData(){return PulseSky.badges(db,{today:key(),proteinGoal:goalValue('protein'),phaseOf:skyPhase})}
function lifeOpenSky(){goView('sky');renderSky()}
/* Announces stars that lit up since the last check. The first run only records. */
function skyCheck(){
 if(!db||(typeof sigilCharge!=='undefined'&&sigilCharge&&!sigilCharge.done))return;const known=db.uiPrefs.stars;const lit=skyData().filter(b=>b.done).map(b=>b.id);
 if(!Array.isArray(known)){db.uiPrefs.stars=lit;save();return}
 const fresh=lit.filter(id=>!known.includes(id));if(!fresh.length)return;
 db.uiPrefs.stars=[...new Set([...known,...lit])];save();
 const b=skyData().find(x=>x.id===fresh[0]);setTimeout(()=>{pulseSound('chime');pulseTap([15,60,15,60,30]);toast('Neuer Stern: '+b.title+(fresh.length>1?' (und '+(fresh.length-1)+' weitere)':''),'')},400);
}
function skySvg(list){
 const G=PulseSky.GROUPS;let lines='',stars='',labels='';
 for(const g of G){const mine=list.filter(b=>b.group===g.id);
  for(let i=1;i<mine.length;i++){const a=mine[i-1],b=mine[i];lines+='<line x1="'+a.x+'" y1="'+a.y+'" x2="'+b.x+'" y2="'+b.y+'" class="'+(a.done&&b.done?'on':'')+'"/>'}
  const cx=g.at.reduce((s,p)=>s+p[0],0)/g.at.length,maxY=Math.max(...g.at.map(p=>p[1]));labels+='<text x="'+cx.toFixed(0)+'" y="'+(maxY+22)+'">'+esc(g.name)+'</text>';
  for(const b of mine)stars+='<g class="star'+(b.done?' on':'')+'"><circle cx="'+b.x+'" cy="'+b.y+'" r="'+(b.done?4.2:2.4)+'"/>'+(b.done?'<circle class="halo" cx="'+b.x+'" cy="'+b.y+'" r="11"/>':'')+'</g>';
 }
 const bg=Array.from({length:70},(_,i)=>{const h=PulseSigil.hash('bg'+i);return '<circle cx="'+(h%360)+'" cy="'+((h>>>9)%300)+'" r="'+(((h>>>18)%3)*.3+.3).toFixed(1)+'"/>'}).join('');
 return '<svg class="sky-svg" viewBox="0 0 360 300" role="img" aria-label="Sternenhimmel mit '+list.filter(b=>b.done).length+' leuchtenden Sternen"><g class="sky-bg">'+bg+'</g><g class="sky-lines">'+lines+'</g>'+stars+'<g class="sky-labels">'+labels+'</g></svg>';
}
function skyGlow(){
 const days=PulseSky.glow(db,key(),{proteinGoal:goalValue('protein')}),first=days[0].date,offset=(new Date(first+'T12:00:00').getDay()+6)%7;
 const cells=Array(offset).fill('<i class="pad"></i>').join('')+days.map(d=>'<i class="g'+d.level+(d.date===key()?' today':'')+'" title="'+esc(lifeDate(d.date,{day:'numeric',month:'short'})+': '+d.points+' Punkte')+'"></i>').join('');
 const active=days.filter(d=>d.level).length;
 return '<section class="sky-card"><div class="life-row"><h2>90 Tage</h2><span class="life-muted">'+active+' leuchtende Tage</span></div><div class="sky-glow" role="img" aria-label="'+active+' von 91 Tagen mit Aktivität">'+cells+'</div><p class="life-footnote">Jeder Tag leuchtet heller, je mehr los war: Training, Essen, Wasser, Einträge, Tarot, Videos, Sigillen. Ein dunkler Tag zerstört nichts.</p></section>';
}
function skyTarot(){
 const h=lifeState().preferences.tarotHistory||[],have=new Set(h.map(x=>x.index)),T=PulseLibrary.TAROT;
 const row=(from,to,label)=>'<div class="sky-deck-row"><span class="life-kicker">'+label+'</span><div class="sky-deck">'+T.slice(from,to).map(c=>'<button type="button" class="'+(have.has(c.index)?'have':'')+'" aria-label="'+esc(c.name+(have.has(c.index)?', gezogen':', noch nicht gezogen'))+'" onclick="'+lifeCall('lifeTarotOpen',c.index)+'"></button>').join('')+'</div></div>';
 return '<section class="sky-card"><div class="life-row"><h2>Tarot-Sammlung</h2><span class="life-muted">'+have.size+' von 78</span></div>'+row(0,22,'Große Arkana')+row(22,36,'Stäbe')+row(36,50,'Kelche')+row(50,64,'Schwerter')+row(64,78,'Pentakel')+'<p class="life-footnote">Jede gezogene Karte leuchtet. Antippen öffnet die Karte.</p></section>';
}
function renderSky(){
 const host=document.getElementById('skyContent');if(!host||document.getElementById('appMain').dataset.view!=='sky')return;
 const list=skyData(),lit=list.filter(b=>b.done).length,R=PulseSky.rank(lit);
 host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Dein Himmel</span><h1>'+esc(R.name)+'</h1><p>'+lit+' von '+list.length+' Sternen leuchten'+(R.next?' · noch '+R.next.need+' bis „'+esc(R.next.name)+'“':'')+'</p></header>'+
  '<div class="sky-frame">'+skySvg(list)+'</div>'+
  PulseSky.GROUPS.map(g=>{const mine=list.filter(b=>b.group===g.id);return '<section class="sky-group"><h3>'+esc(g.name)+' <small>'+esc(g.hint)+' · '+mine.filter(b=>b.done).length+'/'+mine.length+'</small></h3><ul>'+mine.map(b=>'<li class="'+(b.done?'on':'')+'"><span class="sky-dot" aria-hidden="true"></span><span><b>'+esc(b.title)+'</b><small>'+esc(b.desc)+'</small>'+(b.done?'':'<span class="vault-bar" aria-hidden="true"><i style="width:'+Math.round(b.value/b.need*100)+'%"></i></span><small>'+b.value+' / '+b.need+'</small>')+'</span></li>').join('')+'</ul></section>'}).join('')+
  skyGlow()+skyTarot();
}
/* Tag screen: a small sky tile and yesterday in one line. */
function tileSky(){const list=skyData(),lit=list.filter(b=>b.done).length;return '<button type="button" class="pulse-tile tile-sky" onclick="lifeOpenSky()"><span class="pulse-tile-head">Dein Himmel</span><b class="pulse-tile-value">'+lit+' Sterne</b><span class="tile-sky-mini" aria-hidden="true">'+list.slice(0,30).map(b=>'<i class="'+(b.done?'on':'')+'"></i>').join('')+'</span><small>'+esc(PulseSky.rank(lit).name)+'</small></button>'}
function yesterdayLine(){if(dayPeriod()!=='morning')return '';const p=PulseSky.yesterday(db,key(),{proteinGoal:goalValue('protein')});return p.length?'<p class="life-yesterday"><b>Gestern:</b> '+esc(p.join(' · '))+'</p>':''}
/* ---------- Cut-up machine ---------- */
let cutupState={text:'',size:'mittel',seed:1,keep:[]};
function lifeCutup(prefill){
 if(prefill!=null)cutupState={text:prefill,size:'mittel',seed:Date.now()%100000,keep:[]};
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 const notes=PulseLife.list(db).filter(x=>x.room==='ideen'&&x.body.length>40).slice(0,6);
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Cut-up</h2><p class="life-detail-intro">Text zerschneiden, neu mischen, behalten, was überrascht. Die Technik von Brion Gysin und William S. Burroughs, später von David Bowie.</p>'+
  '<label class="life-name-field">Ausgangstext<textarea id="cutupText" rows="5" placeholder="Songtext, Notiz, Tagebuch, Zeitungsartikel …" oninput="cutupState.text=this.value">'+esc(cutupState.text)+'</textarea></label>'+
  (notes.length?'<div class="vault-chips"><span class="life-kicker">Aus deinen Ideen</span>'+notes.map(n=>'<button type="button" onclick="'+lifeCall('cutupFrom',n.id)+'">'+esc(n.title.slice(0,24))+'</button>').join('')+'</div>':'')+
  '<div class="life-seg" role="group" aria-label="Schnipselgröße">'+[['klein','Kleine Schnipsel'],['mittel','Mittel'],['zeilen','Halbe Zeilen']].map(([k,l])=>'<button type="button" aria-pressed="'+(cutupState.size===k)+'" onclick="'+lifeCall('cutupSet','size',k)+'">'+l+'</button>').join('')+'</div>'+
  '<div class="life-detail-actions">'+lifeButton('Zerschneiden und mischen','cutupRun()','life-btn dark')+'</div><div id="cutupOut"></div>';
 if(activeDialog!=='lifeSheet')openDialog(document.getElementById('lifeSheet'),'#cutupText');
 if(cutupState.text.trim())cutupRender();
}
function cutupFrom(id){const x=PulseLife.get(db,id);if(!x)return;cutupState.text=x.title+'\n'+x.body;document.getElementById('cutupText').value=cutupState.text;cutupRun()}
function cutupSet(k,v){cutupState[k]=v;lifeCutup()}
function cutupRun(){cutupState.text=document.getElementById('cutupText')?.value||cutupState.text;if(cutupState.text.trim().split(/\s+/).length<6)return toast('Bitte etwas mehr Text, mindestens ein paar Zeilen.');cutupState.seed=Math.floor(Math.random()*1e9);cutupRender();pulseTap(8)}
function cutupRender(){
 const out=document.getElementById('cutupOut');if(!out)return;const lines=PulseCutup.lines(cutupState.text,{size:cutupState.size,seed:cutupState.seed,count:12});
 out.innerHTML='<div class="cutup-lines">'+lines.map(l=>'<button type="button" class="cutup-line'+(cutupState.keep.includes(l)?' kept':'')+'" onclick="'+lifeCall('cutupKeep',l)+'">'+esc(l)+'</button>').join('')+'</div><div class="life-detail-actions">'+lifeButton('Neu mischen','cutupRun()','life-btn')+'</div>'+
  (cutupState.keep.length?'<div class="vault-block"><h3>Gesammelt</h3><ol class="cutup-keep">'+cutupState.keep.map(l=>'<li>'+esc(l)+'</li>').join('')+'</ol><div class="life-detail-actions">'+lifeButton('Als Notiz in Ideen speichern','cutupSave()','life-btn dark')+lifeButton('Leeren','cutupState.keep=[];cutupRender()','life-textbtn')+'</div></div>':'<p class="life-footnote">Tipp auf eine Zeile, um sie zu sammeln.</p>');
}
function cutupKeep(l){const i=cutupState.keep.indexOf(l);if(i>=0)cutupState.keep.splice(i,1);else cutupState.keep.push(l);cutupRender();pulseTap(6)}
function cutupSave(){const id=uid('life');if(lifeMutate(()=>PulseLife.create(db,{kind:'note',room:'ideen',title:'Cut-up · '+lifeDate(key(),{day:'numeric',month:'short'}),body:cutupState.keep.join('\n')},id,new Date().toISOString()),'Cut-up gespeichert')){cutupState.keep=[];lifeCloseSheet();skyCheck()}}
