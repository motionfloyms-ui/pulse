// SOURCE: ui/raum-schale.js
/* Himmelsraum, singing bowl (front right, between desk and sigil corner, on a low table): strike it with the controller, a fingertip or by
   pointing at it; circle the rim slowly and it starts to sing. The sound is synthesised – five partials, each
   split into two close frequencies, which gives the slow beating of a hand-hammered bowl – and comes from
   where the bowl stands. The water in it trembles. It also keeps time for sitting: three strokes to begin,
   a ring of light that fills, three strokes at the end. */
RAUM_STATIONS.push({id:'schale',label:'Schale',build(k){
 const {THREE}=k,B=PulseRaum.BOWL,A=k.at(-52,1.62),g=new THREE.Group();g.position.set(A.x,0,A.z);g.lookAt(0,0,0);k.scene.add(g);
 const TH=.74,rim=B.rim,depth=B.depth,rs=(rim*rim+depth*depth)/(2*depth),cy=rs-depth,thick=.006;
 {const top=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.03,32),k.mat.dark);top.position.y=TH-.015;const leg=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,TH-.03,10),k.mat.dark);leg.position.y=(TH-.03)/2;
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(.16,.18,.02,24),k.mat.dark);foot.position.y=.01;g.add(top,leg,foot)}
 k.shadow(0,0,.42,.42,0,g);
 const cushion=new THREE.Mesh(new THREE.TorusGeometry(.075,.026,12,32),new THREE.MeshLambertMaterial({color:0x7a2436}));cushion.rotation.x=Math.PI/2;cushion.position.y=TH+.02;g.add(cushion);
 /* The bowl: a spherical shell; its rim centre is the origin of the bowl's own coordinates (as in PulseRaum). */
 const bowl=new THREE.Group();bowl.position.y=TH+.026+depth;g.add(bowl);
 const prof=[],N=18,tr=Math.acos(cy/rs),ri=rs-thick,tri=Math.acos(cy/ri);
 for(let i=0;i<=N;i++){const a=tr*i/N;prof.push(new THREE.Vector2(Math.max(.0001,rs*Math.sin(a)),cy-rs*Math.cos(a)))}
 prof.push(new THREE.Vector2(rim-.0005,.0025),new THREE.Vector2(ri*Math.sin(tri)+.0005,.0025));
 for(let i=N;i>=0;i--){const a=tri*i/N;prof.push(new THREE.Vector2(Math.max(.0001,ri*Math.sin(a)),cy-ri*Math.cos(a)))}
 const metal=new THREE.MeshPhongMaterial({color:0xa27a3e,specular:0xffd9a0,shininess:70,side:THREE.DoubleSide,emissive:0x000000});
 const shell=new THREE.Mesh(new THREE.LatheGeometry(prof,64),metal);bowl.add(shell);
 shell.userData.onSelect=()=>strike(.6);k.hits.push(shell);
 /* Water: it shimmers near the wall where the bowl moves most (four places for the deepest tone). */
 const wy=-depth*.5,wr=Math.sqrt(ri*ri-(wy-cy)*(wy-cy))-.002;
 const waterU={time:{value:0},act:{value:0}};
 const water=new THREE.Mesh(new THREE.CircleGeometry(wr,48).rotateX(-Math.PI/2),new THREE.ShaderMaterial({uniforms:waterU,transparent:true,depthWrite:false,
  vertexShader:'varying vec2 vP;void main(){vP=position.xz/'+wr.toFixed(4)+';gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform float time,act;varying vec2 vP;
void main(){float r=length(vP),a=atan(vP.y,vP.x),lobes=abs(cos(2.0*a));
 float rip=sin(r*95.0-time*34.0)*smoothstep(0.5,1.0,r)*(0.35+0.65*lobes);
 vec3 c=mix(vec3(0.012,0.01,0.008),vec3(0.05,0.032,0.016),r)+vec3(1.0,0.8,0.5)*max(rip*act,0.0)*0.35+vec3(0.9,0.75,0.55)*0.015*(1.0-r);
 gl_FragColor=vec4(c,0.92);
 #include <colorspace_fragment>
}`}));water.position.y=wy;bowl.add(water);
 /* The mallet, lying next to it (pointing at it strikes too). */
 {const stick=new THREE.Mesh(new THREE.CylinderGeometry(.009,.011,.2,10),k.mat.ribWood),head=new THREE.Mesh(new THREE.CylinderGeometry(.018,.018,.05,14),k.mat.leather),m=new THREE.Group();
  head.position.y=.11;m.add(stick,head);m.rotation.set(Math.PI/2,0,.9);m.position.set(.16,TH+.012,.08);g.add(m);stick.userData.onSelect=head.userData.onSelect=()=>strike(.45);k.hits.push(stick,head)}
 /* Rings of light when struck, and the ring on the table that fills while you sit. */
 const ringGeo=new THREE.RingGeometry(.96,1,72).rotateX(-Math.PI/2),waves=[];
 const dots=new THREE.InstancedMesh(new THREE.SphereGeometry(.005,6,4),new THREE.MeshBasicMaterial({color:0xffffff}),60),ON=new THREE.Color(0xffd58a),OFF=new THREE.Color(0x3a2a1a);
 {const m=new THREE.Matrix4();for(let i=0;i<60;i++){const a=i/60*Math.PI*2;m.makeTranslation(Math.sin(a)*.21,TH+.004,Math.cos(a)*.21);dots.setMatrixAt(i,m);dots.setColorAt(i,OFF)}}dots.visible=false;g.add(dots);
 /* Info and the sitting timer, behind the bowl, tilted towards you. */
 const deck=new THREE.Group();deck.position.set(0,TH+.42,-.25);deck.rotation.x=-.42;g.add(deck);
 const info=k.infoPanel(.5,.28);deck.add(info);
 const sitBtns=k.row(deck,[['5 Min',()=>meditate(5)],['10 Min',()=>meditate(10)],['20 Min',()=>meditate(20)]],-.18,{w:.13,h:.05});
 const stopBtn=k.button('Beenden',.16,.05,()=>stopSitting());stopBtn.position.set(0,-.18,0);stopBtn.visible=false;deck.add(stopBtn);
 k.homeButton(deck,0,-.245);
 /* ---------- Sound ---------- */
 let au=null,sing=null;const voices=[];
 function impulse(c,sec){const n=Math.floor(c.sampleRate*sec),b=c.createBuffer(2,n,c.sampleRate);for(let ch=0;ch<2;ch++){const d=b.getChannelData(ch);for(let i=0;i<n;i++){const t=i/c.sampleRate;d[i]=(Math.random()*2-1)*Math.exp(-t/.6)*(t<.015?t/.015:1)}}return b}
 function voice(){const a=k.audio();if(!a)return null;if(au&&au.ctx===a.ctx)return au;const c=a.ctx;
  const pan=c.createPanner();pan.panningModel='HRTF';pan.distanceModel='inverse';pan.refDistance=.7;pan.rolloffFactor=.9;
  const w=bowl.getWorldPosition(new THREE.Vector3());if(pan.positionX){pan.positionX.value=w.x;pan.positionY.value=w.y;pan.positionZ.value=w.z}else pan.setPosition(w.x,w.y,w.z);
  const bus=c.createGain(),dry=c.createGain(),wet=c.createGain(),verb=c.createConvolver();bus.gain.value=.55;dry.gain.value=1;wet.gain.value=.3;verb.buffer=impulse(c,3.4);
  bus.connect(pan);pan.connect(dry);pan.connect(verb);verb.connect(wet);dry.connect(a.out);wet.connect(a.out);
  au={ctx:c,bus};return au}
 let lastHit=-1e9,glowHit=0,strikes=0;
 function strike(power){
  power=Math.max(.05,Math.min(1,power));strikes++;lastHit=performance.now();glowHit=Math.max(glowHit,power);waterU.act.value=Math.max(waterU.act.value,power);
  if(!k.calm())for(let i=0;i<3;i++){const m=new THREE.Mesh(ringGeo,new THREE.MeshBasicMaterial({color:0xffd9a0,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,side:THREE.DoubleSide,fog:false}));m.visible=false;bowl.add(m);waves.push({m,t:-i*.24,p:power})}
  const a=voice();if(!a)return;const c=a.ctx,t=c.currentTime+.004,out=c.createGain(),nodes=[],bright=.35+.65*power;out.connect(a.bus);
  B.partials.forEach(([ratio,amp,t60,beat],i)=>{const level=amp*Math.pow(bright,i)*(.25+.75*power)*.16;
   for(const s of [-1,1]){const o=c.createOscillator(),gn=c.createGain();o.type='sine';o.frequency.value=B.f1*ratio+s*beat/2;
    gn.gain.setValueAtTime(0,t);gn.gain.linearRampToValueAtTime(level*(s>0?1:.8),t+.004+i*.002);gn.gain.setTargetAtTime(0,t+.008,t60/6.9);o.connect(gn);gn.connect(out);o.start(t);o.stop(t+t60*1.15+.3);nodes.push(o)}});
  const nb=c.createBuffer(1,Math.floor(c.sampleRate*.05),c.sampleRate),nd=nb.getChannelData(0);for(let i=0;i<nd.length;i++)nd[i]=(Math.random()*2-1)*Math.exp(-i/(c.sampleRate*.007));
  const ns=c.createBufferSource(),bp=c.createBiquadFilter(),ng=c.createGain();ns.buffer=nb;bp.type='bandpass';bp.frequency.value=1700+1500*power;bp.Q.value=1.1;ng.gain.value=.1*power;ns.connect(bp);bp.connect(ng);ng.connect(out);ns.start(t);nodes.push(ns);
  voices.push({out,nodes});
  while(voices.length>6){const v=voices.shift();try{v.out.gain.setTargetAtTime(0,c.currentTime,.08)}catch(_){}setTimeout(()=>v.nodes.forEach(n=>{try{n.stop()}catch(_){}}),500)}}
 function singNodes(){if(sing)return sing;const a=voice();if(!a)return null;const c=a.ctx,out=c.createGain(),osc=[];out.gain.value=0;out.connect(a.bus);
  for(const [ratio,amp,,beat] of B.partials.slice(0,2))for(const s of [-1,1]){const o=c.createOscillator(),gn=c.createGain();o.type='sine';o.frequency.value=B.f1*ratio+s*beat/2;gn.gain.value=amp*(s>0?.5:.42)*.2;o.connect(gn);gn.connect(out);o.start();osc.push(o)}
  return sing={out,osc,ctx:c}}
 function singStop(){if(!sing)return;const s=sing;sing=null;try{s.out.gain.setTargetAtTime(0,s.ctx.currentTime,.25)}catch(_){}setTimeout(()=>s.osc.forEach(o=>{try{o.stop()}catch(_){}}),1500)}
 /* ---------- Sitting ---------- */
 const med={on:false,start:0,min:0,timers:[],shown:''};let dim=false;
 function three(then){med.timers.push(...[0,4200,8400].map((ms,i)=>setTimeout(()=>{strike(i===2?.8:.65);if(i===2&&then)then()},ms)))}
 function meditate(min){stopSitting(true);med.on=true;med.min=min;med.start=Infinity;three(()=>{med.start=performance.now()});k.say(min+' Minuten. Die Schale beginnt und beendet.',3500);draw()}
 function stopSitting(silent){for(const t of med.timers)clearTimeout(t);med.timers=[];const was=med.on;med.on=false;dots.visible=false;if(was&&!silent){strike(.35);k.say('Beendet.')}draw()}
 function finish(){med.on=false;three(()=>{dots.visible=false});k.say('Die Zeit ist um.',4000);draw()}
 function draw(force){const left=med.on&&Number.isFinite(med.start)?Math.max(0,med.min*60000-(performance.now()-med.start)):null,mm=left==null?'':Math.floor(left/60000)+':'+String(Math.floor(left/1000)%60).padStart(2,'0');
  const text=med.on?(left==null?'Gleich geht es los':'Noch '+mm):'';for(const b of sitBtns)b.visible=!med.on&&!dim;stopBtn.visible=med.on&&!dim;if(text===med.shown&&info.userData.drawn&&!force)return;med.shown=text;info.userData.drawn=true;
  info.userData.set(med.on?{kicker:'Sitzen · '+med.min+' Minuten',title:text,body:'Atmen. Nichts tun müssen. Die Schale sagt dir, wann es vorbei ist.'}:{kicker:'Klangschale',title:'Anschlagen oder kreisen',body:'Mit dem Controller oder der Fingerspitze anschlagen, oder darauf zeigen und drücken. Langsam am Rand entlang kreisen: Sie beginnt zu singen.'});
}
 draw();
 /* ---------- Each frame: strikes and circling from the tips, sound, light ---------- */
 const prev=[null,null],last=[0,0],tipV=new THREE.Vector3();let energy=0,lastSing=0,lastBuzz=0;
 function update(dt,t,now,xr){
  waterU.time.value=t;let target=0,rubber=null;
  if(xr)k.pens.forEach((p,i)=>{const tip=p.src?k.tip(p,tipV):null;if(!tip){prev[i]=null;return}bowl.worldToLocal(tip);const cur={x:tip.x,y:tip.y,z:tip.z},pr=prev[i];
   if(pr){const s=PulseRaum.strike(pr,cur,dt);if(s>0&&now-last[i]>150){last[i]=now;strike(s);k.haptic(p,.2+.8*s,30+70*s)}
    const w=PulseRaum.singTarget(PulseRaum.rimSpeed(pr,cur,dt));if(w>target){target=w;rubber=p}}
   prev[i]=cur});
  energy+=(target-energy)*(1-Math.exp(-dt/(target>energy?1.2:3)));if(energy<.002&&!target)energy=0;
  if(energy>0){const s=singNodes();if(s)s.out.gain.setTargetAtTime(energy*.9,s.ctx.currentTime,.05);lastSing=now}else if(sing&&now-lastSing>4000)singStop();
  if(rubber&&now-lastBuzz>110){lastBuzz=now;k.haptic(rubber,.12+.45*energy,100)}
  glowHit*=Math.exp(-dt*1.4);waterU.act.value=Math.max(energy*1.2,waterU.act.value*Math.exp(-dt*.5));metal.emissive.setRGB(.22*energy+.1*glowHit,.14*energy+.06*glowHit,.04*energy);
  for(let i=waves.length-1;i>=0;i--){const w=waves[i];w.t+=dt;if(w.t<0)continue;const r=rim+w.t*.38;w.m.visible=true;w.m.scale.setScalar(r);w.m.position.y=w.t*.025;w.m.material.opacity=.38*w.p*Math.max(0,1-w.t/2.6);
   if(w.t>2.6){bowl.remove(w.m);w.m.material.dispose();waves.splice(i,1)}}
  if(med.on&&Number.isFinite(med.start)){const p=Math.min(1,(now-med.start)/(med.min*60000)),lit=Math.floor(p*60);dots.visible=true;for(let i=0;i<60;i++)dots.setColorAt(i,i<lit?ON:OFF);dots.instanceColor.needsUpdate=true;if(p>=1)finish()}
  if(med.on&&Math.floor(now/1000)!==med.sec){med.sec=Math.floor(now/1000);draw()}
  /* With "Weniger" the panel fades back while you are not standing here. */
  const want=api.dim?.16:1,o=info.material.opacity;if(Math.abs(o-want)>.004)info.material.opacity=o+(want-o)*Math.min(1,dt*4);if(!!api.dim!==dim){dim=!!api.dim;draw(true)}}
 const api={anchor:bowl,stand:.42,width:.9,update,meditate,strike,
  refresh(){},pause(){singStop();stopSitting(true)},leave(){prev[0]=prev[1]=null;energy=0;singStop()},dispose(){singStop();stopSitting(true);for(const v of voices)v.nodes.forEach(n=>{try{n.stop()}catch(_){}})},
  debug:{strikes:()=>strikes,energy:()=>energy,bowl,med}};
 return api;
}});
