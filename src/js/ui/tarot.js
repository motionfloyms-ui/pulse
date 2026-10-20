// SOURCE: ui/tarot.js
/* Tarot practice: daily card history, personal meanings, drawn spreads. */
const SPREADS={
 drei:{name:'Situation · Hindernis · Rat',positions:['Worum es geht','Was im Weg steht','Was helfen könnte']},
 zeit:{name:'Was war · was ist · was kommt',positions:['Was war','Was ist','Was sich abzeichnet']},
 kreuz:{name:'Kreuz der Entscheidung',positions:['Die Frage selbst','Was für Weg A spricht','Was für Weg B spricht','Was ich übersehe','Was ich wirklich will']}
};
function tarotPrefs(){const p=lifeState().preferences;if(!Array.isArray(p.tarotHistory))p.tarotHistory=[];if(!p.tarotNotes||typeof p.tarotNotes!=='object')p.tarotNotes={};return p}
function tarotStats(){
 const h=tarotPrefs().tarotHistory,count={};for(const x of h)count[x.index]=(count[x.index]||0)+1;
 const top=Object.entries(count).sort((a,b)=>b[1]-a[1])[0];
 return {days:h.length,top:top&&top[1]>1?{card:PulseLibrary.TAROT[top[0]],n:top[1]}:null,count};
}
function randomCards(n){const pool=[...Array(78).keys()],out=[];const r=new Uint32Array(n);crypto.getRandomValues(r);for(let i=0;i<n;i++)out.push(pool.splice(r[i]%pool.length,1)[0]);return out}
let lastSpread=null;
function lifeSpread(kind){
 const sp=SPREADS[kind]||SPREADS.drei;lastSpread={kind,cards:randomCards(sp.positions.length)};renderSpread();
}
function renderSpread(){
 if(!lastSpread)return;const sp=SPREADS[lastSpread.kind];
 libDetailShell('<span class="life-kicker">Legung</span><h2 id="lifeDetailHeading" tabindex="-1">'+esc(sp.name)+'</h2><p class="life-detail-intro">Mit eigenem Deck: selbst legen und die Karten hier nachschlagen.</p><ol class="life-spread">'+
  lastSpread.cards.map((i,k)=>{const c=PulseLibrary.TAROT[i];return '<li><button type="button" onclick="'+lifeCall('lifeTarotOpen',i)+'"><span class="life-spread-pos">'+esc(sp.positions[k])+'</span><b>'+esc(c.name)+'</b><small>'+esc(c.keywords.split(' – ')[0])+'</small></button></li>'}).join('')+'</ol>'+
  '<div class="life-detail-actions">'+lifeButton('Als Notiz speichern',lifeCall('lifeSpreadNote'),'life-btn dark')+lifeButton('Neu legen',lifeCall('lifeSpread',lastSpread.kind),'life-btn')+'</div><div class="life-tarot-links">'+Object.entries(SPREADS).filter(([k])=>k!==lastSpread.kind).map(([k,v])=>lifeButton(v.name,lifeCall('lifeSpread',k),'life-tool-link')).join('')+'</div>');
}
function lifeSpreadNote(){
 if(!lastSpread)return;const sp=SPREADS[lastSpread.kind];
 lifeCompose({kind:'note',room:'sinn',title:'Legung · '+sp.name,source:'tarot-spread',body:lifeDate(key())+'\nMeine Frage:\n\n'+lastSpread.cards.map((i,k)=>{const c=PulseLibrary.TAROT[i];return sp.positions[k]+': '+c.name+'\n'+c.keywords+'\nMein Eindruck:\n'}).join('\n')+'\nWas ich mitnehme:\n'});
}
function lifeTarotHistory(){
 const h=[...tarotPrefs().tarotHistory].reverse(),st=tarotStats();
 libDetailShell('<span class="life-kicker">Dein Tarot-Verlauf</span><h2 id="lifeDetailHeading" tabindex="-1">'+st.days+' '+(st.days===1?'Tageskarte':'Tageskarten')+'</h2>'+(st.top?'<p class="life-detail-intro">Am häufigsten: '+esc(st.top.card.name)+' ('+st.top.n+'×)</p>':'')+
  (h.length?'<div class="life-tarot-list">'+h.slice(0,60).map(x=>{const c=PulseLibrary.TAROT[x.index];return '<button type="button" onclick="'+lifeCall('lifeTarotOpen',x.index)+'"><span class="life-tarot-num">'+esc(x.date.slice(8,10)+'.'+x.date.slice(5,7)+'.')+'</span><span class="grow"><b>'+esc(c.name)+'</b><small>'+(x.source==='deck'?'Aus deinem Deck':'Digital gezogen')+(st.count[x.index]>1?' · '+st.count[x.index]+'× insgesamt':'')+'</small></span><span aria-hidden="true">›</span></button>'}).join('')+'</div>':lifeEmpty('Noch keine Tageskarte.','Digital oder aus deinem Deck.',lifeCall('lifeDrawCard'),'Karte ziehen')));
}
let tarotNoteTimer=null;
function lifeTarotNoteFrom(i){lifeTarotNoteInput(i,event.target.value);const st=document.getElementById('lifeTarotNoteState');if(st)st.textContent='Wird gespeichert …'}
function lifeTarotNoteInput(i,value){const n=tarotPrefs().tarotNotes;if(value.trim())n[i]=value.slice(0,4000);else delete n[i];clearTimeout(tarotNoteTimer);tarotNoteTimer=setTimeout(()=>{if(save()){const s=document.getElementById('lifeTarotNoteState');if(s)s.textContent='Gespeichert'}},500)}

