// SOURCE: ui/feel.js
/* Look and feel: theme (automatic, light, dark), optional sounds, the breathing day pulse,
   and YouTube videos that load only after a tap. */
const THEME_COLORS={light:'#F2F4F3',dark:'#0E1312'};
function pulseThemeChoice(){const t=db?.uiPrefs?.theme;return ['light','dark'].includes(t)?t:'auto'}
let appliedTheme=null;
function applyTheme(t=pulseThemeChoice()){
 if(t===appliedTheme)return;appliedTheme=t;
 const root=document.documentElement;if(t==='auto')root.removeAttribute('data-theme');else root.dataset.theme=t;
 try{localStorage.setItem('pulseTheme',t)}catch(_){}
 document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{const media=m.getAttribute('media')||'';m.setAttribute('content',t==='auto'?(media.includes('dark')?THEME_COLORS.dark:THEME_COLORS.light):THEME_COLORS[t])});
}
function lifeSetTheme(t){if(!['auto','light','dark'].includes(t))return;db.uiPrefs.theme=t;if(save()){applyTheme(t);lifeSettings()}}
function lifeSetHaptics(){db.uiPrefs.haptics=db.uiPrefs.haptics===false;if(save()){lifeSettings();pulseHaptic(12)}}
function lifeSetSound(){db.uiPrefs.sound=!db.uiPrefs.sound;if(save()){lifeSettings();if(db.uiPrefs.sound)pulseSound('pop')}}
function themeSettingsHTML(){
 const t=pulseThemeChoice();
 return '<div class="life-settings-row"><div><b>Darstellung</b><p>Automatisch folgt deinem Handy.</p></div><div class="life-seg" role="group" aria-label="Darstellung">'+[['auto','Auto'],['light','Hell'],['dark','Dunkel']].map(([v,l])=>'<button type="button" aria-pressed="'+(t===v)+'" onclick="'+lifeCall('lifeSetTheme',v)+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="life-settings-row"><div><b>Töne</b><p>Leiser Klick beim Abhaken, Akkord wenn alles für heute erledigt ist.</p></div>'+lifeButton(db.uiPrefs.sound?'An':'Aus',lifeCall('lifeSetSound'),'life-btn')+'</div>'+
  '<div class="life-settings-row"><div><b>Vibration</b><p>Kurzes Tippen unter dem Finger bei Tabs, beim Abhaken und beim Eintragen.</p></div>'+lifeButton(db.uiPrefs.haptics===false?'Aus':'An',lifeCall('lifeSetHaptics'),'life-btn')+'</div>';
}
/* Tiny synthesised sounds, no audio files. Off unless switched on in the settings. */
let pulseAudio=null;
function pulseSound(kind='pop'){
 if(!db?.uiPrefs?.sound)return;
 if(navigator.userActivation&&!navigator.userActivation.hasBeenActive)return;
 try{
  const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;
  pulseAudio=pulseAudio||new AC();const a=pulseAudio;if(a.state==='suspended')a.resume();
  const t=a.currentTime,notes=kind==='chime'?[523.25,659.25,783.99,1046.5]:[740];
  notes.forEach((f,i)=>{
   const o=a.createOscillator(),g=a.createGain(),s=t+i*(kind==='chime'?.08:0),len=kind==='chime'?1.1:.16;
   o.type=kind==='chime'?'sine':'triangle';o.frequency.setValueAtTime(kind==='chime'?f:f*1.25,s);if(kind!=='chime')o.frequency.exponentialRampToValueAtTime(f,s+.05);
   g.gain.setValueAtTime(0.0001,s);g.gain.exponentialRampToValueAtTime(kind==='chime'?.09:.14,s+.01);g.gain.exponentialRampToValueAtTime(0.0001,s+len);
   o.connect(g);g.connect(a.destination);o.start(s);o.stop(s+len+.05);
  });
 }catch(_){}
}
/* The day pulse: share of today's tasks done, protein and water goals, training (or a rest day). 0–1. */
function dayScore(){
 const d=today(),parts=[];
 const tasks=PulseLife.day(db,key()).filter(x=>x.kind==='task');if(tasks.length)parts.push(tasks.filter(x=>x.status==='done').length/tasks.length);
 const p=goalValue('protein');if(p)parts.push(Math.min(1,(d.protein||0)/p));
 const w=Number(db.waterGoal)||2;parts.push(Math.min(1,(d.water||0)/w));
 const c=pulseContext();parts.push(trainedOn(key())||c.mode==='recovery'||!c.training?1:0);
 return parts.length?parts.reduce((a,b)=>a+b,0)/parts.length:0;
}
function pulseCore(){
 const s=dayScore(),pct=Math.round(s*100);
 return '<button type="button" class="pulse-core" style="--p:'+s.toFixed(2)+'" onclick="lifeExplainPulse()" aria-label="Tagespuls '+pct+' Prozent. Erklärung öffnen"><span class="pulse-core-orb" aria-hidden="true"></span><b>'+pct+'</b></button>';
}
function lifeExplainPulse(){
 const d=today(),tasks=PulseLife.day(db,key()).filter(x=>x.kind==='task'),p=goalValue('protein'),w=Number(db.waterGoal)||2,c=pulseContext();
 const rows=[tasks.length?['Aufgaben heute',tasks.filter(x=>x.status==='done').length+' von '+tasks.length]:null,p?['Protein',Math.round(d.protein||0)+' von '+p+' g']:null,['Wasser',de(d.water||0)+' von '+de(w)+' L'],['Training',trainedOn(key())?'erledigt':c.mode==='recovery'?'Erholungstag':!c.training?'heute keins geplant':'offen']].filter(Boolean);
 document.getElementById('lifeForm').hidden=true;const el=document.getElementById('lifeDetail');el.hidden=false;
 el.innerHTML='<h2 id="lifeDetailHeading" tabindex="-1">Tagespuls: '+Math.round(dayScore()*100)+' %</h2><p class="life-detail-intro">Der Kreis wird wärmer und schlägt schneller, je mehr vom Tag erledigt ist. Er setzt sich jeden Morgen zurück, es geht nichts verloren.</p><dl class="cos-facts">'+rows.map(([a,b])=>'<dt>'+esc(a)+'</dt><dd>'+esc(b)+'</dd>').join('')+'</dl><div class="life-detail-actions">'+lifeButton('Schließen','lifeCloseSheet()','life-btn')+'</div>';
 openDialog(document.getElementById('lifeSheet'),'#lifeDetailHeading');
}
/* After a task is ticked off: sound, and the chord when the day's tasks are all done. */
function pulseCelebrate(){
 const tasks=PulseLife.day(db,key()).filter(x=>x.kind==='task');
 if(tasks.length>1&&tasks.every(x=>x.status==='done')){pulseSound('chime');pulseTap([12,60,18]);toast('Alle Aufgaben für heute erledigt.')}else pulseSound('pop');
}
/* YouTube: a quiet placeholder; the player (youtube-nocookie) loads only after a tap. */
function videoCard(v,title=''){
 return '<div class="pulse-video'+(v.short?' short':'')+'" data-video="'+esc(v.id)+'"><button type="button" class="pulse-video-play" onclick="'+lifeCall('videoPlay',v.id,v.start||0,!!v.short)+'" aria-label="Video abspielen'+(title?': '+esc(title):'')+'"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M8 5.5v13l11-6.5z"/></svg><span>Video abspielen</span><small>lädt von youtube-nocookie.com</small></button><a class="life-textbtn" href="'+esc(PulseVideo.watch(v))+'" target="_blank" rel="noopener noreferrer">In YouTube öffnen ↗</a></div>';
}
function videoPlay(id,start,short){
 const host=document.querySelector('.pulse-video[data-video="'+CSS.escape(id)+'"]');if(!host)return;
 const f=document.createElement('iframe');f.src=PulseVideo.embed({id,start});f.title='YouTube-Video';f.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';f.allowFullscreen=true;f.referrerPolicy='strict-origin-when-cross-origin';f.loading='lazy';
 host.querySelector('.pulse-video-play')?.replaceWith(f);
}
function itemVideo(x){return x?(PulseVideo.parse(x.url)||PulseVideo.find(x.body)):null}
/* Storage gauge for the settings: localStorage holds about 5.2 million characters per site. */
function storageUsageHTML(){
 let u;try{u=storage.usage()}catch(_){return ''}
 const pct=Math.min(100,Math.round(u.used/u.quota*100)),mb=n=>(n/1e6).toLocaleString('de-DE',{maximumFractionDigits:1});
 if(u.mode==='idb')return '<div class="life-settings-row storage-row"><div><b>Speicher im Browser</b><p>Deine Daten liegen in der Browser-Datenbank (IndexedDB), dort gibt es praktisch keine Grenze. Größe: '+mb(u.size)+' Mio. Zeichen.</p></div></div>';
 return '<div class="life-settings-row storage-row"><div><b>Speicher im Browser</b><p>'+mb(u.used)+' von etwa '+mb(u.quota)+' Mio. Zeichen belegt ('+pct+' %)'+(u.backups?', davon '+mb(u.backups)+' Mio. für ältere Sicherungskopien':'')+'.'+(pct>=70?' Wird es voll, zieht Pulse automatisch in die größere Browser-Datenbank um.':'')+'</p><span class="vault-bar'+(pct>=70?' warn':'')+'" aria-hidden="true"><i style="width:'+pct+'%"></i></span></div>'+(u.backups?lifeButton('Kopien löschen','storageDropBackups()','life-btn'):'')+'</div>';
}
function storageDropBackups(){try{storage.dropBackups();toast('Ältere Sicherungskopien gelöscht')}catch(e){toast(e.message)}lifeSettings()}
/* Full-screen overlays (sigil charging, stage mode, warm-up): background inert, Android back closes them. */
let overlayOpen=null,overlayBackPending=false;
function overlayEnter(id,onBack){if(overlayOpen)return;overlayOpen={id,onBack};backgroundInert(true);try{history.pushState({...(history.state||{}),pulseOverlay:id},'',location.hash)}catch(_){}}
function overlayLeave(){if(!overlayOpen)return;overlayOpen=null;backgroundInert(false);if(history.state?.pulseOverlay){overlayBackPending=true;history.back()}}
/* Called first by the popstate handler; true when the event belonged to an overlay. */
function overlayPop(){if(overlayBackPending){overlayBackPending=false;return true}if(overlayOpen){const o=overlayOpen;overlayOpen=null;backgroundInert(false);try{o.onBack()}catch(_){}return true}return false}

/* ---------- Touch feel: a short tick under the finger, sheets that leave downwards and follow a drag,
   and the dock stepping aside for the keyboard. ---------- */
function pulseHaptic(ms=8){try{if(db?.uiPrefs?.haptics!==false&&navigator.vibrate&&(!navigator.userActivation||navigator.userActivation.hasBeenActive))navigator.vibrate(ms)}catch(_){}}
document.addEventListener('click',e=>{if(e.target.closest&&e.target.closest('#lifeNav button,.life-check,.day-add button,.home-switch,.body-quick button,.tile-water,.life-day,.cos-day,.stapel-nav button'))pulseHaptic(8)},true);
function sheetLeave(wrapper){
 if(wrapper.classList.contains('dragged')||document.body.classList.contains('life-calm'))return;
 wrapper.classList.add('closing');setTimeout(()=>wrapper.classList.remove('closing'),210);
}
(function(){
 let panel=null,y0=0,dy=0,t0=0;
 document.addEventListener('touchstart',e=>{
  panel=null;if(e.touches.length!==1||!e.target.closest)return;
  const p=e.target.closest('.modal.open .modalbox');if(!p||p.scrollTop>0||e.target.closest('input,textarea,select,button,a,label'))return;
  const y=e.touches[0].clientY;if(y-p.getBoundingClientRect().top>72)return;
  panel=p;y0=y;dy=0;t0=Date.now();p.style.transition='none';
 },{passive:true});
 document.addEventListener('touchmove',e=>{if(!panel)return;dy=Math.max(0,e.touches[0].clientY-y0);panel.style.transform='translateY('+dy+'px)'},{passive:true});
 const end=()=>{
  if(!panel)return;const p=panel,w=p.closest('.modal');panel=null;
  p.style.transition='transform .2s cubic-bezier(.2,.8,.2,1)';
  if(dy>110||(dy>36&&Date.now()-t0<260)){
   p.style.transform='translateY(110%)';
   setTimeout(()=>{if(w&&w.classList.contains('open')){w.classList.add('dragged');closeDialog(w);setTimeout(()=>w.classList.remove('dragged'),60)}p.style.transform='';p.style.transition=''},190);
  }else{p.style.transform='';setTimeout(()=>{p.style.transition=''},210)}
 };
 document.addEventListener('touchend',end);document.addEventListener('touchcancel',end);
 let base=window.innerHeight,width=window.innerWidth;
 window.addEventListener('resize',()=>{if(window.innerWidth!==width){width=window.innerWidth;base=window.innerHeight}if(window.innerHeight>base)base=window.innerHeight;document.body.classList.toggle('kbd',base-window.innerHeight>140)});
})();
