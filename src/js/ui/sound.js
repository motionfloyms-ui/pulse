// SOURCE: ui/sound.js
/* Klangraum: brown noise, rain, sea and a drone, synthesised with Web Audio (no files). */
const PulseSoundscape=(()=>{
 let ctx=null,master=null,nodes=[],current='',volume=.6,gen=0;
 const KINDS=[['','Aus'],['brown','Rauschen'],['rain','Regen'],['sea','Meer'],['drone','Drone']];
 function audio(){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;if(!ctx){ctx=new AC();master=ctx.createGain();master.gain.value=0;master.connect(ctx.destination)}if(ctx.state==='suspended')ctx.resume();return ctx}
 function noise(kind){const len=ctx.sampleRate*4,buf=ctx.createBuffer(2,len,ctx.sampleRate);for(let ch=0;ch<2;ch++){const d=buf.getChannelData(ch);let last=0,b0=0,b1=0,b2=0;for(let i=0;i<len;i++){const w=Math.random()*2-1;if(kind==='brown'){last=(last+0.02*w)/1.02;d[i]=last*3.2}else if(kind==='pink'){b0=0.99765*b0+w*0.099046;b1=0.963*b1+w*0.2965164;b2=0.57*b2+w*1.0526913;d[i]=(b0+b1+b2+w*0.1848)*0.18}else d[i]=w*0.5}}const s=ctx.createBufferSource();s.buffer=buf;s.loop=true;return s}
 function lfo(freq,depth,target){const o=ctx.createOscillator(),g=ctx.createGain();o.frequency.value=freq;g.gain.value=depth;o.connect(g);g.connect(target);o.start();nodes.push(o)}
 function build(kind){
  const out=ctx.createGain();out.connect(master);nodes.push(out);
  if(kind==='brown'){const n=noise('brown'),f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=900;n.connect(f);f.connect(out);n.start();nodes.push(n);out.gain.value=.9}
  if(kind==='rain'){const n=noise('pink'),hp=ctx.createBiquadFilter(),lp=ctx.createBiquadFilter();hp.type='highpass';hp.frequency.value=400;lp.type='lowpass';lp.frequency.value=7000;n.connect(hp);hp.connect(lp);lp.connect(out);n.start();nodes.push(n);out.gain.value=.55;
   const drops=noise('white'),bp=ctx.createBiquadFilter(),dg=ctx.createGain();bp.type='bandpass';bp.frequency.value=3200;bp.Q.value=2;dg.gain.value=0;drops.connect(bp);bp.connect(dg);dg.connect(out);drops.start();nodes.push(drops);
   const mine=gen;const tick=()=>{if(current!=='rain'||gen!==mine)return;const t=ctx.currentTime;dg.gain.cancelScheduledValues(t);dg.gain.setValueAtTime(.0001,t);dg.gain.exponentialRampToValueAtTime(.25+Math.random()*.3,t+.005);dg.gain.exponentialRampToValueAtTime(.0001,t+.05);setTimeout(tick,40+Math.random()*180)};tick()}
  if(kind==='sea'){const n=noise('brown'),f=ctx.createBiquadFilter(),g=ctx.createGain();f.type='lowpass';f.frequency.value=600;g.gain.value=.55;n.connect(f);f.connect(g);g.connect(out);n.start();nodes.push(n);lfo(0.085,.42,g.gain);lfo(0.085,380,f.frequency);out.gain.value=1}
  if(kind==='drone'){const f=ctx.createBiquadFilter();f.type='lowpass';f.frequency.value=420;f.Q.value=4;f.connect(out);lfo(0.05,180,f.frequency);
   for(const [type,freq,gain,det] of [['sawtooth',55,.12,0],['sawtooth',55,.1,7],['sine',82.41,.22,0],['sine',110,.16,-4],['triangle',164.81,.05,3]]){const o=ctx.createOscillator(),g=ctx.createGain();o.type=type;o.frequency.value=freq;o.detune.value=det;g.gain.value=gain;o.connect(g);g.connect(f);o.start();nodes.push(o)}
   out.gain.value=.9}
 }
 function stopNodes(){const old=nodes;nodes=[];setTimeout(()=>old.forEach(n=>{try{n.stop?.()}catch(_){}try{n.disconnect()}catch(_){}}),700)}
 function play(kind){
  if(kind===current)return;if(!audio())return toast('Dieser Browser kann keine Klänge erzeugen.');
  const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.setValueAtTime(master.gain.value,t);master.gain.linearRampToValueAtTime(0,t+.6);stopNodes();current=kind;gen++;
  if(!kind)return;build(kind);master.gain.linearRampToValueAtTime(volume*.8,t+1.6);
 }
 function setVolume(v){volume=Math.max(0,Math.min(1,Number(v)));if(ctx&&current){const t=ctx.currentTime;master.gain.cancelScheduledValues(t);master.gain.linearRampToValueAtTime(volume*.8,t+.2)}}
 const playing=()=>current;
 return {KINDS,play,setVolume,playing,volume:()=>volume};
})();
function soundPick(kind){PulseSoundscape.play(kind);document.querySelectorAll('.sound-chips').forEach(el=>el.outerHTML=soundChips(el.dataset.label||''))}
function soundChips(label='Klang'){
 const cur=PulseSoundscape.playing();
 return '<div class="sound-chips" data-label="'+esc(label)+'"><span class="life-kicker">'+esc(label)+'</span><div class="vault-chips" role="group" aria-label="'+esc(label)+'">'+PulseSoundscape.KINDS.map(([k,l])=>'<button type="button" aria-pressed="'+(cur===k)+'" onclick="'+lifeCall('soundPick',k)+'">'+l+'</button>').join('')+'</div>'+(cur?'<label class="sound-vol">Lautstärke<input type="range" min="0" max="1" step="0.05" value="'+PulseSoundscape.volume()+'" oninput="PulseSoundscape.setVolume(this.value)"/></label>':'')+'</div>';
}
/* Metronome: Web Audio click, accent on beat one, scheduled ahead for steady timing. */
const PulseMetronome=(()=>{
 let ctx=null,timer=null,next=0,beat=0,bpm=90,beats=4,onBeat=null;
 function tick(){while(next<ctx.currentTime+0.12){const o=ctx.createOscillator(),g=ctx.createGain(),accent=beat%beats===0;o.frequency.value=accent?1560:1040;g.gain.setValueAtTime(0.0001,next);g.gain.exponentialRampToValueAtTime(accent?.5:.3,next+.002);g.gain.exponentialRampToValueAtTime(0.0001,next+.06);o.connect(g);g.connect(ctx.destination);o.start(next);o.stop(next+.08);const b=beat%beats,at=next;setTimeout(()=>onBeat&&onBeat(b),Math.max(0,(at-ctx.currentTime)*1000));next+=60/bpm;beat++}}
 function start(b,cb,n=4){const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return false;ctx=ctx||new AC();if(ctx.state==='suspended')ctx.resume();bpm=Math.max(30,Math.min(300,Number(b)||90));beats=n;onBeat=cb;stop();beat=0;next=ctx.currentTime+.08;timer=setInterval(tick,25);tick();return true}
 function stop(){if(timer){clearInterval(timer);timer=null}}
 function setBpm(b){bpm=Math.max(30,Math.min(300,Number(b)||bpm))}
 return {start,stop,setBpm,running:()=>!!timer,bpm:()=>bpm};
})();
/* A sustained reference tone (warm-up): soft sine with a little octave, fades in and out. */
const PulseTone=(()=>{
 let ctx=null,nodes=[],gain=null;
 function play(freq){stop();const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return;ctx=ctx||new AC();if(ctx.state==='suspended')ctx.resume();gain=ctx.createGain();gain.gain.value=0;gain.connect(ctx.destination);for(const [m,v] of [[1,.22],[2,.05],[.5,.06]]){const o=ctx.createOscillator(),g=ctx.createGain();o.type='sine';o.frequency.value=freq*m;g.gain.value=v;o.connect(g);g.connect(gain);o.start();nodes.push(o)}gain.gain.linearRampToValueAtTime(.8,ctx.currentTime+.8)}
 function stop(){if(!ctx||!gain)return;const g=gain,old=nodes;nodes=[];gain=null;g.gain.cancelScheduledValues(ctx.currentTime);g.gain.setValueAtTime(g.gain.value,ctx.currentTime);g.gain.linearRampToValueAtTime(0,ctx.currentTime+.5);setTimeout(()=>old.forEach(o=>{try{o.stop()}catch(_){}}),700)}
 return {play,stop,playing:()=>!!gain};
})();
