// SOURCE: ui/feel.js
/* Look and feel: theme (automatic, light, dark), optional sounds, the breathing day pulse,
   and YouTube videos that load only after a tap. */
const THEME_COLORS={light:'#F2F1F6',dark:'#08090E'};
function pulseThemeChoice(){const t=db?.uiPrefs?.theme;return ['light','dark'].includes(t)?t:'auto'}
function applyTheme(t=pulseThemeChoice()){
 const root=document.documentElement;if(t==='auto')root.removeAttribute('data-theme');else root.dataset.theme=t;
 try{localStorage.setItem('pulseTheme',t)}catch(_){}
 document.querySelectorAll('meta[name="theme-color"]').forEach(m=>{const media=m.getAttribute('media')||'';m.setAttribute('content',t==='auto'?(media.includes('dark')?THEME_COLORS.dark:THEME_COLORS.light):THEME_COLORS[t])});
}
function lifeSetTheme(t){if(!['auto','light','dark'].includes(t))return;db.uiPrefs.theme=t;if(save()){applyTheme(t);lifeSettings()}}
function lifeSetSound(){db.uiPrefs.sound=!db.uiPrefs.sound;if(save()){lifeSettings();if(db.uiPrefs.sound)pulseSound('pop')}}
function themeSettingsHTML(){
 const t=pulseThemeChoice();
 return '<div class="life-settings-row"><div><b>Darstellung</b><p>Automatisch folgt deinem Handy.</p></div><div class="life-seg" role="group" aria-label="Darstellung">'+[['auto','Auto'],['light','Hell'],['dark','Dunkel']].map(([v,l])=>'<button type="button" aria-pressed="'+(t===v)+'" onclick="'+lifeCall('lifeSetTheme',v)+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="life-settings-row"><div><b>Töne</b><p>Leiser Klick beim Abhaken, Akkord wenn alles für heute erledigt ist.</p></div>'+lifeButton(db.uiPrefs.sound?'An':'Aus',lifeCall('lifeSetSound'),'life-btn')+'</div>';
}
/* Tiny synthesised sounds, no audio files. Off unless switched on in the settings. */
let pulseAudio=null;
function pulseSound(kind='pop'){
 if(!db?.uiPrefs?.sound)return;
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
