// SOURCE: ui/raum.js
/* Himmelsraum: a warm round room under a dome of wooden ribs, in a forest clearing on a meadow that slopes
   down to the sea, mountains behind. The sky follows the real time in Wuppertal (sun, dusk, tonight's stars,
   the moon in its true phase and place) or a chosen time of day. Left the tarot corner, right the sigil
   corner, in front a breathing orb and a desk, on a side table a notebook: in VR you write into the air
   and the light lands on the page. A 3D view on the phone, a WebXR room on the Quest.
   In VR the room is a hub: stations stand around it (day board, daily stack, singing bowl, the corners);
   the desk or the menu on the hand takes you there, with a short fade.
   three.js (MIT, vendor/three) is loaded only when the room is opened. */
/* Stations of the hub. Other files add {id, label, build(kit)}; build returns {anchor, stand, update, refresh, dispose}. */
const RAUM_STATIONS=[];
const RAUM_TIMES=[['echt','Jetzt'],['morgen','Morgen'],['tag','Tag'],['abend','Abend'],['nacht','Nacht']];
const RAUM_SOUNDS=[['','Still'],['sea','Meer'],['rain','Regen'],['brown','Rauschen'],['drone','Drone']];
let RAUM=null,raumImport=null,raumXR=false,raumBuilding=false;
function raumPrefs(){
 const u=db.uiPrefs;if(!u.raum||typeof u.raum!=='object'||Array.isArray(u.raum))u.raum={};const p=u.raum;
 if(!RAUM_TIMES.some(t=>t[0]===p.time))p.time='echt';
 if(!RAUM_SOUNDS.some(s=>s[0]===p.sound))p.sound='sea';
 if(typeof p.breath!=='boolean')p.breath=true;
 if(typeof p.calm!=='boolean')p.calm=!!reducedMotion();
 return p;
}
/* Notebook pages are ordinary notes (room "Innenleben") marked with source "raum", oldest first. */
function raumPages(){return PulseLife.list(db).filter(x=>x.kind==='note'&&x.source==='raum').sort((a,b)=>String(a.createdAt||'').localeCompare(String(b.createdAt||'')))}
function raumTitle(ms=Date.now()){const d=new Date(ms),p=n=>String(n).padStart(2,'0');return 'Notizbuch · '+d.toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'})+', '+p(d.getHours())+':'+p(d.getMinutes())}
function lifeOpenRaum(){goView('raum')}
function renderRaum(){
 const host=document.getElementById('raumContent');if(!host||document.getElementById('appMain').dataset.view!=='raum')return;
 if(!document.getElementById('raumStage')){
  host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Zum Runterkommen · auch für die Quest</span><h1>Himmelsraum</h1></header>'+
   '<div class="raum-stage" id="raumStage"><canvas id="raumCanvas" role="img" aria-label="Himmelsraum: ein runder Raum unter freiem Himmel. Zum Umschauen ziehen, zum Auswählen tippen."></canvas>'+
   '<p class="raum-status" id="raumStatus" aria-live="polite">Der Raum wird gebaut …</p>'+
   (document.fullscreenEnabled?'<button type="button" class="raum-full" onclick="raumFull()" aria-label="Vollbild an oder aus"><svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/></svg></button>':'')+
   '<div class="raum-type" id="raumType" hidden><label class="life-kicker" for="raumTypeArea">Getippt auf die Seite</label><textarea id="raumTypeArea" rows="5" maxlength="20000" placeholder="Was möchtest du festhalten?"></textarea><div class="raum-actions">'+lifeButton('Übernehmen','raumTypeDone(true)','life-btn dark')+(pulseSpeechSupported()?lifeButton('Sprechen',"pulseDictate('raumTypeArea')",'life-btn'):'')+lifeButton('Abbrechen','raumTypeDone(false)','life-btn')+'</div></div></div>'+
   '<textarea id="raumDictate" hidden></textarea>'+
   '<div id="raumControls" class="raum-controls"></div>'+
   '<p class="life-footnote">Vorn das Meer, hinten die Berge, links die Tarotecke, rechts die Sigillenecke, vorn links das Notizbuch, vorn rechts die Klangschale, hinten die Tagestafel und dein Stapel. Zum Umschauen ziehen, zum Auswählen tippen. Auf der Quest diese Seite im Browser öffnen und „In VR betreten“ tippen. In der Brille bringt dich das Pult zu den Stationen; das Menü an der Hand öffnet die A- oder X-Taste, ohne Controller drehst du die Handfläche zu dir. Knöpfe lassen sich auch mit der Fingerspitze drücken. Beenden mit „Verlassen“ am Pult oder mit der Meta-Taste. Die Quest hat ihren eigenen PULSE-Speicher; mit „Abgleichen“ bringst du Handy und Quest auf denselben Stand.</p>';
  raumStart();
 }
 raumControls();
 if(RAUM){RAUM.refresh();RAUM.resume()}
}
function raumControls(){
 const el=document.getElementById('raumControls');if(!el)return;const p=raumPrefs(),cur=PulseSoundscape.playing(),pages=raumPages().length;
 el.innerHTML=(raumXR?'<div class="raum-actions">'+lifeButton('In VR betreten','raumEnterVR()','life-btn dark')+'</div>':'')+
  '<div class="raum-row"><span class="life-kicker">Himmel</span><div class="life-seg" role="group" aria-label="Tageszeit im Raum">'+RAUM_TIMES.map(([k,l])=>'<button type="button" aria-pressed="'+(p.time===k)+'" onclick="'+lifeCall('raumSet','time',k)+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="raum-row"><span class="life-kicker">Klang</span><div class="vault-chips" role="group" aria-label="Klang im Raum">'+RAUM_SOUNDS.map(([k,l])=>'<button type="button" aria-pressed="'+(cur===k)+'" onclick="'+lifeCall('raumSet','sound',k)+'">'+l+'</button>').join('')+'</div></div>'+
  '<div class="raum-row"><span class="life-kicker">Notizbuch'+(pages?' · '+pages+(pages===1?' Seite':' Seiten'):'')+(p.draft?' · Entwurf offen':'')+'</span><div class="raum-actions">'+lifeButton('Aufschlagen','raumBook()','life-btn')+lifeButton(p.draft?'Weiterschreiben':'Schreiben','raumWrite()','life-btn')+'</div></div>'+
  '<div class="raum-row">'+lifeButton(p.breath?'Atemkugel ausblenden':'Atemkugel zeigen',lifeCall('raumSet','breath',!p.breath),'life-btn')+'</div>'+
  '<div class="raum-row"><span class="life-kicker">Handy und Quest</span><div class="raum-actions">'+lifeButton('Abgleichen','syncOpen()','life-btn')+'</div></div>';
}
function raumSet(what,v){
 const p=raumPrefs();
 if(what==='time'&&RAUM_TIMES.some(t=>t[0]===v)){p.time=v;RAUM?.setTime(v)}
 else if(what==='sound'&&RAUM_SOUNDS.some(s=>s[0]===v)){p.sound=v;if(RAUM)RAUM.setSound(v);else PulseSoundscape.play(v)}
 else if(what==='breath'){p.breath=!!v;RAUM?.setBreath(p.breath)}
 save();raumControls();
}
function raumStageFocus(){document.getElementById('raumStage')?.scrollIntoView({block:'nearest',behavior:reducedMotion()?'auto':'smooth'})}
function raumBook(){if(!RAUM)return toast('Der Raum lädt noch.');raumStageFocus();RAUM.openBook()}
function raumWrite(){if(!RAUM)return toast('Der Raum lädt noch.');raumStageFocus();RAUM.write()}
function raumEnterVR(){if(RAUM)RAUM.enterVR();else toast('Der Raum lädt noch.')}
function raumFull(){const st=document.getElementById('raumStage');if(!st)return;if(document.fullscreenElement)document.exitFullscreen?.().catch(()=>{});else st.requestFullscreen?.().catch(()=>toast('Vollbild geht hier nicht.'))}
function raumTypeOpen(text){const box=document.getElementById('raumType'),area=document.getElementById('raumTypeArea');if(!box||!area)return;area.value=text||'';box.hidden=false;area.focus()}
function raumTypeDone(ok){const box=document.getElementById('raumType'),area=document.getElementById('raumTypeArea');if(!box||!area)return;if(pulseDictation)pulseStopDictation();if(ok&&RAUM)RAUM.setText(area.value);box.hidden=true}
async function raumStart(){
 if(raumBuilding)return;raumBuilding=true;
 const status=document.getElementById('raumStatus');if(status){status.hidden=false;status.textContent='Der Raum wird gebaut …'}
 let THREE=null;
 try{if(!raumImport)raumImport=import('./vendor/three/three.module.min.js');THREE=await raumImport}
 catch(e){raumImport=null;raumBuilding=false;return raumFail(navigator.onLine?'Die 3D-Bibliothek ließ sich nicht laden.':'Beim ersten Öffnen braucht der Raum Internet. Danach geht er auch offline.',e)}
 try{
  const canvas=document.getElementById('raumCanvas');if(!canvas)return;
  if(RAUM){RAUM.dispose();RAUM=null}
  RAUM=raumBuild(THREE,canvas);
  const s=document.getElementById('raumStatus');if(s)s.hidden=true;
  if(document.getElementById('appMain').dataset.view==='raum')RAUM.resume();
 }catch(e){RAUM=null;raumFail('Dieses Gerät kann im Browser kein 3D (WebGL) zeigen.',e)}
 finally{raumBuilding=false}
 raumCheckXR();
}
function raumFail(msg,e){const s=document.getElementById('raumStatus');if(s){s.hidden=false;s.innerHTML=esc(msg)+' '+lifeButton('Nochmal versuchen','raumStart()','life-textbtn')+'<span class="raum-alt">Ohne 3D: '+lifeButton('Tag',"goView('life')",'life-textbtn')+lifeButton('Stapel','lifeOpenStapel()','life-textbtn')+lifeButton('Tarot',"lifeTarotBrowse('major',false)",'life-textbtn')+lifeButton('Sigillen','lifeOpenSigils()','life-textbtn')+'</span>'}console.warn('Himmelsraum',e)}
async function raumCheckXR(){try{const ok=!!(navigator.xr&&await navigator.xr.isSessionSupported('immersive-vr'));if(ok!==raumXR){raumXR=ok;raumControls()}}catch(_){}}
/* ---------- The scene ---------- */
function raumBuild(THREE,canvas){
 const prefs=raumPrefs(),LAT=51.2562,LON=7.1508,RAD=Math.PI/180,SEA=-20;
 const V=(x=0,y=0,z=0)=>new THREE.Vector3(x,y,z),C=h=>new THREE.Color(h);
 let seed=20261023;const rnd=()=>{seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296};
 const R=(a,b)=>a+rnd()*(b-a),lerp=(a,b,t)=>a+(b-a)*t,clamp=(x,a,b)=>Math.max(a,Math.min(b,x)),smooth=(a,b,x)=>{const t=clamp((x-a)/(b-a),0,1);return t*t*(3-2*t)};
 const at=(t,r)=>({x:-Math.sin(t*RAD)*r,z:-Math.cos(t*RAD)*r});
 const dayKey=ms=>{const d=new Date(ms),p=n=>String(n).padStart(2,'0');return d.getFullYear()+'-'+p(d.getMonth()+1)+'-'+p(d.getDate())};
 const hhmm=ms=>new Date(ms).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
 const FONT=getComputedStyle(document.body).fontFamily||'system-ui, sans-serif',SERIF='Georgia, "Noto Serif", "Times New Roman", serif';
 const renderer=new THREE.WebGLRenderer({canvas,antialias:true,powerPreference:'high-performance'});
 renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2));renderer.outputColorSpace=THREE.SRGBColorSpace;
 renderer.xr.enabled=true;renderer.xr.setReferenceSpaceType('local-floor');
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(70,1,.03,5000),rig=new THREE.Group();
 camera.rotation.order='YXZ';camera.position.set(0,1.35,0);rig.add(camera);scene.add(rig);
 let yaw=0,pitch=0;const look=()=>camera.rotation.set(pitch,yaw,0);look();
 scene.fog=new THREE.Fog(0xb8cde0,110,1350);
 const presenting=()=>renderer.xr.isPresenting;
 const hits=[],tV=V(),tV2=V(),tV3=V(),tQ=new THREE.Quaternion(),tM=new THREE.Matrix4();
 /* ---------- Textures ---------- */
 const aniso=Math.min(8,renderer.capabilities.getMaxAnisotropy());
 function canvasTex(w,h,draw){const c=document.createElement('canvas');c.width=w;c.height=h;const t=new THREE.CanvasTexture(c);t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=aniso;t.userData.canvas=c;if(draw)draw(c.getContext('2d'),w,h);return t}
 const glow=(a,b)=>canvasTex(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,a);r.addColorStop(.3,b);r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
 const GLOW_WARM=glow('rgba(255,240,205,1)','rgba(255,170,85,.5)'),GLOW_SOFT=glow('rgba(255,250,238,.95)','rgba(255,224,178,.3)'),GLOW_MOON=glow('rgba(214,226,255,.5)','rgba(150,170,230,.14)'),GLOW_FIRE=glow('rgba(240,255,175,1)','rgba(170,230,80,.45)'),GLOW_INK=glow('rgba(255,250,232,1)','rgba(255,200,120,.6)');
 const sprite=(map,s,color=0xffffff,op=1)=>{const m=new THREE.Sprite(new THREE.SpriteMaterial({map,color,transparent:true,opacity:op,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));m.scale.set(s,s,1);return m};
 /* Soft contact shadows: a blurred dark patch on the floor under each piece of furniture, so nothing floats. */
 const SHADOW=canvasTex(128,128,g=>{const r=g.createRadialGradient(64,64,0,64,64,64);r.addColorStop(0,'rgba(0,0,0,.6)');r.addColorStop(.5,'rgba(0,0,0,.34)');r.addColorStop(1,'rgba(0,0,0,0)');g.fillStyle=r;g.fillRect(0,0,128,128)});
 const shadowGeo=new THREE.PlaneGeometry(1,1).rotateX(-Math.PI/2),shadowMat=new THREE.MeshBasicMaterial({map:SHADOW,transparent:true,depthWrite:false,fog:false});
 function shadow(x,z,rx,rz=rx,rot=0,parent=scene,y=.009){const m=new THREE.Mesh(shadowGeo,shadowMat);m.position.set(x,y,z);m.scale.set(rx*2,1,rz*2);m.rotation.y=rot;m.renderOrder=1;parent.add(m);return m}
 /* ---------- Land: a clearing, a meadow sloping to the sea in front (west, -z), mountains behind ---------- */
 const perm=new Uint8Array(512);{const p=[...Array(256).keys()];for(let i=255;i>0;i--){const j=Math.floor(rnd()*(i+1));[p[i],p[j]]=[p[j],p[i]]}for(let i=0;i<512;i++)perm[i]=p[i&255]}
 const vnoise=(x,y)=>{const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf),h=(a,b)=>perm[perm[a&255]+(b&255)]/255;return lerp(lerp(h(xi,yi),h(xi+1,yi),u),lerp(h(xi,yi+1),h(xi+1,yi+1),u),v)};
 const fbm=(x,y)=>vnoise(x,y)*.5+vnoise(x*2.03+5.2,y*2.03+1.3)*.27+vnoise(x*4.11+9.1,y*4.11+3.7)*.15+vnoise(x*8.3+2.7,y*8.3+6.1)*.08;
 /* Three octaves only: the finer ones were smaller than the far mesh and made the peaks jagged. */
 const ridge=(x,y)=>{let s=0,a=.6,f=1;for(let i=0;i<3;i++){const n=1-Math.abs(vnoise(x*f+i*7.3,y*f+i*3.1)*2-1);s+=n*n*a;a*=.5;f*=2.1}return s};
 function ground(x,z){
  const r=Math.hypot(x,z),fwd=r>.001?-z/r:0;
  let h=(fbm(x*.012+3.1,z*.012+7.7)-.45)*16*smooth(11,46,r);
  h+=smooth(70,420,r)*fbm(x*.004+2,z*.004+4)*48*smooth(.1,-.6,fwd);
  h+=smooth(360,820,r)*smooth(.25,-.3,fwd)*(ridge(x*.0022+11,z*.0022+5)*560-40);
  const w=smooth(.05,.55,fwd);
  return h*(1-w)-34*(1-Math.exp(-Math.max(0,r-6)/34))*w;
 }
 /* ---------- Sky ---------- */
 const skyU={sunDir:{value:V(0,1,0)},moonDir:{value:V(0,-1,0)},zenith:{value:C(0x3d78cf)},horizon:{value:C(0xcfe0f0)},glow:{value:C(0xfff1d8)},sunVis:{value:1},moonGlow:{value:0}};
 const sky=new THREE.Mesh(new THREE.SphereGeometry(2400,48,24),new THREE.ShaderMaterial({side:THREE.BackSide,depthWrite:false,uniforms:skyU,
  vertexShader:'varying vec3 vDir;void main(){vDir=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform vec3 sunDir,moonDir,zenith,horizon,glow;uniform float sunVis,moonGlow;varying vec3 vDir;
void main(){vec3 d=normalize(vDir);float h=max(d.y,0.0);
 vec3 c=mix(horizon,zenith,pow(h,0.45));
 float sd=max(dot(d,sunDir),0.0);
 c+=glow*(pow(sd,5.0)*0.30+pow(sd,40.0)*0.45)*sunVis*(1.0-0.5*h);
 vec2 dh=normalize(d.xz+vec2(1e-5)),sh=normalize(sunDir.xz+vec2(1e-5));
 c=mix(c,glow,pow(1.0-h,6.0)*(1.0-smoothstep(0.05,0.35,abs(sunDir.y)))*0.35*sunVis*pow(dot(dh,sh)*0.5+0.5,3.0));
 c+=vec3(1.0,0.95,0.86)*smoothstep(0.99965,0.99985,sd)*min(sunVis*1.5,1.0)*step(-0.02,sunDir.y);
 float md=max(dot(d,moonDir),0.0);c+=vec3(0.5,0.56,0.72)*pow(md,18.0)*0.22*moonGlow;
 if(d.y<0.0)c=mix(horizon,horizon*0.6,clamp(-d.y*4.0,0.0,1.0));
 gl_FragColor=vec4(c,1.0);
 #include <colorspace_fragment>
}`}));
 sky.renderOrder=-10;sky.frustumCulled=false;scene.add(sky);
 /* Stars: the bright ones in their real places (Orion, Big Dipper, Cassiopeia, Summer Triangle, Pleiades …),
    many faint ones and the Milky Way; they turn with the sidereal time around the celestial pole. */
 const BRIGHT=[[101.29,-16.72,-1.46,'b'],[213.92,19.18,-.05,'o'],[279.23,38.78,.03,'b'],[79.17,46.0,.08,'y'],[78.63,-8.2,.13,'b'],[114.83,5.22,.34,'w'],[88.79,7.41,.5,'r'],[297.7,8.87,.77,'w'],[68.98,16.51,.86,'o'],[247.35,-26.43,.96,'r'],[201.3,-11.16,.97,'b'],[116.33,28.03,1.14,'o'],[344.41,-29.62,1.16,'w'],[310.36,45.28,1.25,'w'],[152.09,11.97,1.35,'b'],[113.65,31.89,1.58,'w'],[37.95,89.26,1.98,'y'],
  [165.93,61.75,1.79,'o'],[165.46,56.38,2.37,'w'],[178.46,53.69,2.44,'w'],[183.86,57.03,3.3,'w'],[193.51,55.96,1.77,'w'],[200.98,54.93,2.23,'w'],[206.89,49.31,1.86,'b'],
  [85.19,-1.94,1.77,'b'],[84.05,-1.2,1.69,'b'],[83.0,-.3,2.23,'b'],[81.28,6.35,1.64,'b'],[86.94,-9.67,2.09,'b'],[10.13,56.54,2.24,'o'],[2.29,59.15,2.28,'w'],[14.18,60.72,2.47,'b'],[21.45,60.24,2.68,'w'],[28.6,63.67,3.37,'b'],
  [56.87,24.11,2.87,'b'],[57.29,24.05,3.6,'b'],[56.22,24.11,3.7,'b'],[56.46,24.37,3.9,'b'],[56.58,23.95,4.2,'b'],[56.3,24.47,4.3,'b'],
  [305.56,40.26,2.23,'y'],[311.55,33.97,2.48,'o'],[296.24,45.13,2.87,'w'],[292.68,27.96,3.05,'o'],[296.56,10.61,2.72,'o'],[298.83,6.41,3.71,'y'],[177.26,14.57,2.14,'w'],[154.99,19.84,2.08,'o'],[168.53,20.52,2.56,'w'],[81.57,28.61,1.65,'b'],
  [51.08,49.86,1.79,'y'],[47.04,40.96,2.1,'b'],[2.1,29.09,2.06,'b'],[17.43,35.62,2.05,'r'],[30.97,42.33,2.1,'o'],[346.19,15.21,2.48,'w'],[345.94,28.08,2.42,'r'],[3.31,15.18,2.83,'b'],[89.88,44.95,1.9,'w'],[233.67,26.71,2.23,'w'],[222.68,74.16,2.08,'o'],[230.18,71.83,3.0,'w'],[104.66,-28.97,1.5,'b'],[107.1,-26.39,1.84,'y']];
 const TINT={b:[.78,.86,1],w:[1,1,1],y:[1,.95,.82],o:[1,.84,.66],r:[1,.7,.55]};
 const phi=LAT*RAD,Mv=V(-Math.sin(phi),Math.cos(phi),0),Ev=V(0,0,1),Pv=V(Math.cos(phi),Math.sin(phi),0);
 const eq=(ra,dec)=>{const a=ra*RAD,d=dec*RAD;return V(Math.cos(d)*Math.cos(a),Math.cos(d)*Math.sin(a),Math.sin(d))};
 const toBase=e=>Mv.clone().multiplyScalar(e.x).addScaledVector(Ev,e.y).addScaledVector(Pv,e.z);
 const sPos=[],sSize=[],sTint=[],sPhase=[],sAlpha=[];
 const addStar=(e,size,t,alpha=1)=>{const v=toBase(e).normalize().multiplyScalar(2200);sPos.push(v.x,v.y,v.z);sSize.push(size);const c=TINT[t]||TINT.w;sTint.push(c[0],c[1],c[2]);sPhase.push(rnd()*6.283);sAlpha.push(alpha)};
 const magSize=m=>Math.max(1,Math.min(6,4-.65*m)),magAlpha=m=>clamp(1.25-.13*m,.4,1);
 for(const [ra,dec,mag,t] of BRIGHT)addStar(eq(ra,dec),magSize(mag),t,magAlpha(mag));
 for(let i=0;i<2600;i++){const z=rnd()*2-1,a=rnd()*6.283,c=Math.sqrt(1-z*z),m=R(3.8,6.3);addStar(V(c*Math.cos(a),c*Math.sin(a),z),magSize(m),rnd()<.2?'b':rnd()<.3?'y':'w',magAlpha(m))}
 {const gp=eq(192.859,27.128),ga=V(0,0,1).cross(gp).normalize(),gb=gp.clone().cross(ga),gc=eq(266.405,-28.936),lc=Math.atan2(gc.dot(gb),gc.dot(ga));
  const band=(l,g)=>ga.clone().multiplyScalar(Math.cos(l)*Math.cos(g)).addScaledVector(gb,Math.sin(l)*Math.cos(g)).addScaledVector(gp,Math.sin(g));
  for(let i=0;i<2400;){const l=rnd()*6.283,k=.5+.5*Math.cos(l-lc),m=R(5.4,6.8);if(rnd()>.4+.6*k*k)continue;addStar(band(l,(rnd()+rnd()+rnd()-1.5)*.12*(1+.7*k)),magSize(m),'w',magAlpha(m));i++}
  for(let i=0;i<900;){const l=rnd()*6.283,k=.5+.5*Math.cos(l-lc);if(rnd()>.3+.7*k*k)continue;addStar(band(l,(rnd()+rnd()+rnd()-1.5)*.09*(1+.6*k)),R(40,90),rnd()<.6?'w':'b',.008+.014*k);i++}}
 const starGeo=new THREE.BufferGeometry();
 starGeo.setAttribute('position',new THREE.Float32BufferAttribute(sPos,3));starGeo.setAttribute('size',new THREE.Float32BufferAttribute(sSize,1));starGeo.setAttribute('tint',new THREE.Float32BufferAttribute(sTint,3));starGeo.setAttribute('phase',new THREE.Float32BufferAttribute(sPhase,1));starGeo.setAttribute('alpha',new THREE.Float32BufferAttribute(sAlpha,1));
 const starU={vis:{value:0},time:{value:0},px:{value:renderer.getPixelRatio()}};
 const stars=new THREE.Points(starGeo,new THREE.ShaderMaterial({uniforms:starU,transparent:true,depthWrite:false,blending:THREE.AdditiveBlending,
  vertexShader:'attribute float size;attribute vec3 tint;attribute float phase;attribute float alpha;uniform float px;uniform float time;varying vec3 vT;varying float vA;varying float vK;void main(){vT=tint;vK=step(0.3,alpha);vA=alpha*mix(1.0,0.78+0.22*sin(time*(1.1+phase*0.35)+phase*7.0),vK);gl_PointSize=size*px;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:'uniform float vis;varying vec3 vT;varying float vA;varying float vK;void main(){float d=length(gl_PointCoord-0.5);float soft=1.0-smoothstep(0.0,0.5,d);float a=mix(soft*soft,1.0-smoothstep(0.12,0.5,d),vK);gl_FragColor=vec4(vT,a*vis*vA);\n#include <colorspace_fragment>\n}'}));
 stars.frustumCulled=false;stars.renderOrder=-9;scene.add(stars);
 /* The moon: lit from the real direction of the sun, so its phase is simply right. */
 const moonU={sunDir:{value:V(1,0,0)},day:{value:0}};
 const moon=new THREE.Mesh(new THREE.SphereGeometry(26,40,20),new THREE.ShaderMaterial({uniforms:moonU,transparent:true,depthWrite:false,
  vertexShader:'varying vec3 vN;varying vec3 vP;void main(){vN=normalize(mat3(modelMatrix)*normal);vP=position;gl_Position=projectionMatrix*modelViewMatrix*vec4(position,1.0);}',
  fragmentShader:`uniform vec3 sunDir;uniform float day;varying vec3 vN;varying vec3 vP;
float hs(vec3 p){return fract(sin(dot(p,vec3(12.9898,78.233,37.719)))*43758.5453);}
float vn(vec3 p){vec3 i=floor(p),f=fract(p);f=f*f*(3.0-2.0*f);return mix(mix(mix(hs(i),hs(i+vec3(1,0,0)),f.x),mix(hs(i+vec3(0,1,0)),hs(i+vec3(1,1,0)),f.x),f.y),mix(mix(hs(i+vec3(0,0,1)),hs(i+vec3(1,0,1)),f.x),mix(hs(i+vec3(0,1,1)),hs(i+vec3(1,1,1)),f.x),f.y),f.z);}
void main(){float l=dot(normalize(vN),sunDir);float lit=smoothstep(-0.03,0.12,l);vec3 q=normalize(vP)*2.4;float m=vn(q)*0.6+vn(q*2.7)*0.4;
 vec3 surf=mix(vec3(0.97,0.95,0.9),vec3(0.62,0.62,0.62),smoothstep(0.42,0.68,m));
 gl_FragColor=vec4(mix(vec3(0.03,0.035,0.05),surf,lit),mix(1.0,lit*0.8,day));
 #include <colorspace_fragment>
}`}));
 moon.renderOrder=-8;scene.add(moon);const moonHalo=sprite(GLOW_MOON,340,0xffffff,.7);moonHalo.renderOrder=-8;scene.add(moonHalo);
 const cloudTex=canvasTex(256,128,g=>{for(let i=0;i<20;i++){const x=40+rnd()*176,y=48+rnd()*40,r=16+rnd()*34,gr=g.createRadialGradient(x,y,0,x,y,r);gr.addColorStop(0,'rgba(255,255,255,.5)');gr.addColorStop(1,'rgba(255,255,255,0)');g.fillStyle=gr;g.fillRect(0,0,256,128)}});
 const clouds=new THREE.Group();scene.add(clouds);
 for(let i=0;i<13;i++){const m=new THREE.Sprite(new THREE.SpriteMaterial({map:cloudTex,transparent:true,depthWrite:false,fog:false}));const a=rnd()*6.283,el=R(4,20)*RAD,d=R(1000,1600);m.position.set(Math.cos(a)*Math.cos(el)*d,Math.sin(el)*d,Math.sin(a)*Math.cos(el)*d);const s=R(420,820);m.scale.set(s,s*.42,1);m.renderOrder=-7;clouds.add(m)}
 /* Ground: a polar grid, fine near the room and coarse towards the mountains. */
 {const RINGS=128,SEG=240,R0=3.47,GROW=Math.pow(2600/R0,1/RINGS),n=(RINGS+1)*(SEG+1),pos=new Float32Array(n*3),col=new Float32Array(n*3),idx=[];
  const c=new THREE.Color(),c2=new THREE.Color(),cA=C(0x86a35a),cB=C(0x9bb46a),cG=C(0x5f8240),cG2=C(0x47662f),cFar=C(0x3f5631),cRock=C(0x7d7270),cRock2=C(0x5d5660),cSand=C(0xcdb88f),cWet=C(0x8c7c60),cSnow=C(0xeef1f8);
  for(let i=0;i<=RINGS;i++){const r=R0*Math.pow(GROW,i);for(let j=0;j<=SEG;j++){
   const a=j/SEG*Math.PI*2,x=Math.sin(a)*r,z=Math.cos(a)*r,h=ground(x,z),k=(i*(SEG+1)+j)*3;pos[k]=x;pos[k+1]=h;pos[k+2]=z;
   const e=Math.max(.5,r*.03),sl=(Math.abs(ground(x+e,z)-h)+Math.abs(ground(x,z+e)-h))/e,nz=fbm(x*.05,z*.05);
   if(h<SEA-1.2)c.copy(cWet);else if(h<SEA+1.6&&-z/r>.05)c.copy(cSand).lerp(cWet,smooth(SEA+1.6,SEA-1.2,h)*.5);
   /* Soft transitions (painted): meadow into rock by slope and height, rock into snow higher up, less snow where steep. */
   else{if(r<11)c.copy(cA).lerp(cB,nz);else c.copy(cG).lerp(cG2,nz).lerp(cFar,smooth(140,700,r)*.7);
    c.lerp(c2.copy(cRock).lerp(cRock2,nz),Math.max(smooth(.5,1.15,sl),smooth(95+nz*60,165+nz*60,h)));c.lerp(cSnow,smooth(195+nz*90,275+nz*90,h)*(1-.75*smooth(1.1,2,sl)))}
   col[k]=c.r;col[k+1]=c.g;col[k+2]=c.b}}
  for(let i=0;i<RINGS;i++)for(let j=0;j<SEG;j++){const a=i*(SEG+1)+j,b=a+SEG+1;idx.push(a,b,a+1,b,b+1,a+1)}
  const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.BufferAttribute(pos,3));g.setAttribute('color',new THREE.BufferAttribute(col,3));g.setIndex(idx);g.computeVertexNormals();
  scene.add(new THREE.Mesh(g,new THREE.MeshLambertMaterial({vertexColors:true})))}
 /* The sea: sky reflection with Fresnel, small waves and the glitter path of sun and moon. */
 const seaU={sunDir:{value:V(0,1,0)},moonDir:{value:V(0,-1,0)},zenith:{value:C(0x3d78cf)},horizon:{value:C(0xcfe0f0)},sunCol:{value:C(0xfff1d8)},sunVis:{value:1},moonVis:{value:0},time:{value:0},fogColor:{value:C(0xb8cde0)},fogNear:{value:160},fogFar:{value:1900}};
 const sea=new THREE.Mesh(new THREE.PlaneGeometry(12000,12000).rotateX(-Math.PI/2),new THREE.ShaderMaterial({uniforms:seaU,
  vertexShader:'varying vec3 vW;void main(){vec4 w=modelMatrix*vec4(position,1.0);vW=w.xyz;gl_Position=projectionMatrix*viewMatrix*w;}',
  fragmentShader:`uniform vec3 sunDir,moonDir,zenith,horizon,sunCol,fogColor;uniform float sunVis,moonVis,time,fogNear,fogFar;varying vec3 vW;
vec2 wave(vec2 p,vec2 d,float f,float a,float s){return d*cos(dot(p,d)*f+time*s)*f*a;}
void main(){vec3 toCam=cameraPosition-vW;float dist=length(toCam);vec3 v=toCam/dist;
 float far=smoothstep(40.0,1600.0,dist);
 vec2 g=wave(vW.xz,vec2(0.8,0.6),0.21,0.16,1.1)+wave(vW.xz,vec2(-0.5,0.86),0.33,0.09,1.6)+wave(vW.xz,vec2(0.97,-0.24),0.57,0.05,2.3)+wave(vW.xz,vec2(-0.2,-0.98),0.9,0.03,2.9)+wave(vW.xz,vec2(0.6,-0.8),1.7,0.012,3.7);
 g*=mix(1.0,0.35,far);
 vec3 n=normalize(vec3(-g.x,1.0,-g.y));
 vec3 r=reflect(-v,n);r.y=abs(r.y);
 vec3 skyc=mix(horizon,zenith,pow(clamp(r.y,0.0,1.0),0.5));
 float fr=0.02+0.98*pow(1.0-max(dot(v,n),0.0),5.0);
 vec3 c=mix(mix(zenith,horizon,0.3)*0.16,skyc,fr);
 float sp=mix(600.0,60.0,far);
 c+=sunCol*pow(max(dot(r,sunDir),0.0),sp)*sunVis*mix(4.0,1.4,far);
 c+=vec3(0.75,0.8,0.95)*pow(max(dot(r,moonDir),0.0),sp*0.8)*moonVis*1.6;
 c=mix(c,fogColor,clamp((dist-fogNear)/(fogFar-fogNear),0.0,1.0));
 gl_FragColor=vec4(c,1.0);
 #include <colorspace_fragment>
}`}));
 sea.position.y=SEA;scene.add(sea);
 /* Trees: forest at the sides, scattered and lower behind (so the mountains show), none towards the sea.
    Painted shapes: firs of four scalloped tiers and leafy crowns of soft lumps, darker below and lighter above.
    Trees, grass and flowers sway a little: the vertex shader bends them by height (off with "Weniger"). */
 const windU={time:{value:0}};
 function windMat(params,a,base=0){const m=new THREE.MeshLambertMaterial(params),amp={value:a},b={value:base};m.userData.amp=amp;m.userData.full=a;
  m.onBeforeCompile=sh=>{sh.uniforms.uTime=windU.time;sh.uniforms.uAmp=amp;sh.uniforms.uBase=b;sh.vertexShader='uniform float uTime;uniform float uAmp;uniform float uBase;\n'+sh.vertexShader.replace('#include <project_vertex>',
   'vec4 mvPosition=vec4(transformed,1.0);\n#ifdef USE_INSTANCING\nmvPosition=instanceMatrix*mvPosition;vec3 ip=instanceMatrix[3].xyz;\n#else\nvec3 ip=vec3(0.0);\n#endif\nfloat hgt=max(0.0,mvPosition.y-ip.y+uBase);float sw=sin(uTime*1.1+ip.x*.07+ip.z*.05)*.6+sin(uTime*2.3+ip.x*.13+ip.z*.11)*.25;\nmvPosition.xz+=vec2(.8,.6)*sw*uAmp*hgt*hgt;\nmvPosition=modelViewMatrix*mvPosition;\ngl_Position=projectionMatrix*mvPosition;')};
  return m}
 const windMats=[];
 /* Weld duplicate corners (so lumps shade smoothly); merge parts together with their vertex colours. */
 function weld(g){const pos=g.attributes.position,map=new Map(),out=[],idx=[];for(let i=0;i<pos.count;i++){const k=Math.round(pos.getX(i)*1e4)+','+Math.round(pos.getY(i)*1e4)+','+Math.round(pos.getZ(i)*1e4);let j=map.get(k);if(j===undefined){j=out.length/3;map.set(k,j);out.push(pos.getX(i),pos.getY(i),pos.getZ(i))}idx.push(j)}
  const w=new THREE.BufferGeometry();w.setAttribute('position',new THREE.Float32BufferAttribute(out,3));w.setIndex(idx);return w}
 function merge(list){let n=0,ni=0;for(const g of list){n+=g.attributes.position.count;ni+=g.index.count}
  const pos=new Float32Array(n*3),nor=new Float32Array(n*3),col=new Float32Array(n*3),idx=new Uint32Array(ni);let o=0,oi=0;
  for(const g of list){const c=g.attributes.position.count;pos.set(g.attributes.position.array,o*3);nor.set(g.attributes.normal.array,o*3);col.set(g.attributes.color.array,o*3);for(let i=0;i<g.index.count;i++)idx[oi+i]=g.index.array[i]+o;oi+=g.index.count;o+=c}
  const m=new THREE.BufferGeometry();m.setAttribute('position',new THREE.BufferAttribute(pos,3));m.setAttribute('normal',new THREE.BufferAttribute(nor,3));m.setAttribute('color',new THREE.BufferAttribute(col,3));m.setIndex(new THREE.BufferAttribute(idx,1));return m}
 const paint=(g,fn)=>{const p=g.attributes.position,col=new Float32Array(p.count*3);for(let i=0;i<p.count;i++)col.set(fn(p,i),i*3);g.setAttribute('color',new THREE.BufferAttribute(col,3));return g};
 function firGeo(){return merge([[0,.46,1],[.2,.42,.82],[.4,.38,.62],[.6,.4,.42]].map(([y0,h,r],ti)=>{const g=new THREE.ConeGeometry(r,h,12,1);g.translate(0,y0+h/2,0);
  paint(g,(p,i)=>{const x=p.getX(i),y=p.getY(i),z=p.getZ(i),a=Math.atan2(z,x),t=(y-y0)/h;if(t<.02){const k=1+.12*Math.sin(a*7+ti*1.7);p.setXYZ(i,x*k,y-.035*(.5+.5*Math.sin(a*7+ti*1.7)),z*k)}const v=(.55+.5*t)*(.84+.3*(y0+h*t));return [v*.92,v,v*.84]});g.computeVertexNormals();return g}))}
 function crownGeo(){return merge([[0,0,0,.74],[.46,.1,.12,.52],[-.42,.14,-.16,.54],[.06,.44,-.04,.52],[-.12,.04,.46,.5],[.16,-.06,-.46,.48]].map(([cx,cy,cz,r],bi)=>{const g=weld(new THREE.IcosahedronGeometry(r,bi<3?1:0));
  paint(g,(p,i)=>{const x=p.getX(i),y=p.getY(i),z=p.getZ(i),n=1+.13*Math.sin(x*9+y*7+bi)+.08*Math.sin(z*11-y*5);p.setXYZ(i,x*n+cx,y*n+cy,z*n+cz);const v=.5+.62*Math.max(0,Math.min(1,(y*n+cy+.7)/1.4));return [v,v,v*.9]});g.computeVertexNormals();return g}))}
 {const N=900,trunkG=new THREE.CylinderGeometry(.08,.2,1,7).translate(0,.5,0),leaves=windMat({vertexColors:true},.0011),bark=windMat({color:0x5a4030},.0011);windMats.push(leaves,bark);
  const trunks=new THREE.InstancedMesh(trunkG,bark,N),firs=new THREE.InstancedMesh(firGeo(),leaves,N),crowns=new THREE.InstancedMesh(crownGeo(),leaves,N);
  let nt=0,nc=0,nb=0;const m=new THREE.Matrix4(),q=new THREE.Quaternion(),s=V(),p=V(),c=new THREE.Color(),up=V(0,1,0);
  for(let tries=0;tries<30000&&nt<N;tries++){
   const r=12+Math.pow(rnd(),1.4)*230,a=rnd()*6.283,x=Math.sin(a)*r,z=Math.cos(a)*r,fwd=-z/r;
   const dens=fwd>.3?0:fwd>.05?(.3-fwd)*3:fwd<-.45?(r<60?.4:.7):1;if(rnd()>dens)continue;
   const h=ground(x,z);if(h<SEA+3||h>150)continue;
   const H=(fwd<-.45&&r<60?R(4.5,8):R(7,14))*(r>90?1.2:1);q.setFromAxisAngle(up,rnd()*6.283);
   s.set(1,H*.28,1);p.set(x,h-.2,z);m.compose(p,q,s);trunks.setMatrixAt(nt++,m);
   if(r<35||rnd()<.7||nb>=N){const w=H*.2;c.setHSL(.3+R(-.03,.03),R(.32,.5),R(.2,.3)+.05,THREE.SRGBColorSpace);R(0,1);R(0,1);R(0,1);s.set(w,H*.7,w);p.set(x,h+H*.24,z);m.compose(p,q,s);firs.setMatrixAt(nc,m);firs.setColorAt(nc++,c)}
   else{const w=H*.3;s.set(w,w*.9,w);p.set(x,h+H*.55,z);m.compose(p,q,s);crowns.setMatrixAt(nb,m);c.setHSL(R(.2,.27),R(.35,.55),R(.26,.36),THREE.SRGBColorSpace);crowns.setColorAt(nb++,c)}}
  trunks.count=nt;firs.count=nc;crowns.count=nb;scene.add(trunks,firs,crowns);
  /* Meadow: tufts of blades and flowers on thin stems around the room. */
  const tuftGeo=(()=>{const pos=[],col=[],nor=[];for(let k=0;k<4;k++){const a=k*Math.PI/2+.4,ca=Math.cos(a),sa=Math.sin(a),w=.018,l=.08;
    pos.push(-sa*w,0,ca*w,sa*w,0,-ca*w,ca*l,.32,sa*l);col.push(.4,.48,.28,.4,.48,.28,1.12,1.16,.9);nor.push(0,1,0,0,1,0,0,1,0)}
   const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));g.setAttribute('normal',new THREE.Float32BufferAttribute(nor,3));g.setAttribute('color',new THREE.Float32BufferAttribute(col,3));return g})();
  const flowerGeo=(()=>{const stem=new THREE.CylinderGeometry(.005,.007,.45,4).translate(0,-.225,0),head=weld(new THREE.IcosahedronGeometry(.045,0));head.scale(1,.62,1);
   paint(stem,()=>[.36,.6,.26]);paint(head,()=>[1,1,1]);stem.computeVertexNormals();head.computeVertexNormals();return merge([stem,head])})();
  const grassMat=windMat({vertexColors:true,side:THREE.DoubleSide},.55),flowerMat=windMat({vertexColors:true},.5,.3);windMats.push(grassMat,flowerMat);
  const tufts=new THREE.InstancedMesh(tuftGeo,grassMat,900),flowers=new THREE.InstancedMesh(flowerGeo,flowerMat,420);
  const FL=[0xfff6e0,0xf6d354,0xb98ad8,0xf2a0b8,0xffffff];let nu=0,nf=0;
  for(let i=0;i<900;i++){const r=R(3.7,30),a=rnd()*6.283,x=Math.sin(a)*r,z=Math.cos(a)*r,h=ground(x,z);if(h<SEA+2)continue;q.setFromAxisAngle(up,rnd()*6.283);const k=R(.6,1.4);s.set(k,k*R(.7,1.3),k);p.set(x,h-.02,z);m.compose(p,q,s);tufts.setMatrixAt(nu,m);c.setHSL(R(.22,.3),R(.35,.55),R(.25,.36),THREE.SRGBColorSpace);tufts.setColorAt(nu++,c);
   if(nf<420&&rnd()<.5){p.set(x+R(-.2,.2),h+R(.12,.3),z+R(-.2,.2));s.setScalar(R(.7,1.2));m.compose(p,q,s);flowers.setMatrixAt(nf,m);flowers.setColorAt(nf++,c.setHex(FL[Math.floor(rnd()*FL.length)]))}}
  tufts.count=nu;flowers.count=nf;scene.add(tufts,flowers)}
 /* ---------- The room ---------- */
 const floorTex=canvasTex(1024,1024,g=>{for(let r=0;r<16;r++){let x=-rnd()*300;while(x<1024){const w=R(220,420);g.fillStyle='hsl('+R(24,32)+','+R(38,48)+'%,'+R(27,34)+'%)';g.fillRect(x,r*64,w,64);g.strokeStyle='rgba(40,22,10,.5)';g.lineWidth=2;g.strokeRect(x,r*64,w,64);for(let k=0;k<6;k++){g.strokeStyle='rgba(60,32,14,'+R(.06,.16)+')';g.beginPath();const y=r*64+R(6,58);g.moveTo(x,y);g.bezierCurveTo(x+w*.3,y+R(-6,6),x+w*.6,y+R(-6,6),x+w,y+R(-4,4));g.stroke()}x+=w}}});
 floorTex.wrapS=floorTex.wrapT=THREE.RepeatWrapping;floorTex.repeat.set(2,2);
 const wallTex=canvasTex(1024,256,g=>{for(let x=0;x<1024;x+=64){g.fillStyle='hsl('+R(22,30)+','+R(36,46)+'%,'+R(26,33)+'%)';g.fillRect(x,0,64,256);g.fillStyle='rgba(30,16,8,.45)';g.fillRect(x,0,3,256);for(let k=0;k<4;k++){g.strokeStyle='rgba(60,32,14,'+R(.06,.15)+')';g.beginPath();const xx=x+R(8,56);g.moveTo(xx,0);g.bezierCurveTo(xx+R(-5,5),80,xx+R(-5,5),170,xx+R(-4,4),256);g.stroke()}}const gr=g.createLinearGradient(0,0,0,256);gr.addColorStop(0,'rgba(0,0,0,.22)');gr.addColorStop(.2,'rgba(0,0,0,0)');gr.addColorStop(.62,'rgba(0,0,0,0)');gr.addColorStop(1,'rgba(10,4,0,.5)');g.fillStyle=gr;g.fillRect(0,0,1024,256)});
 wallTex.wrapS=THREE.RepeatWrapping;wallTex.repeat.set(10,1);
 const wood=new THREE.MeshLambertMaterial({map:floorTex}),dark=new THREE.MeshLambertMaterial({color:0x5b3a24}),ribWood=new THREE.MeshLambertMaterial({color:0x7a5232}),leather=new THREE.MeshLambertMaterial({color:0x5a2430});
 const floor=new THREE.Mesh(new THREE.CylinderGeometry(3.46,3.46,.14,72),new THREE.MeshPhongMaterial({map:floorTex,specular:0x2b1d10,shininess:26}));floor.position.y=-.07;scene.add(floor);
 const GAP=1.2,GAPD=GAP/2/RAD;
 {const o=new THREE.Mesh(new THREE.CylinderGeometry(3.46,3.46,.62,72,1,true,Math.PI+GAP/2,2*Math.PI-GAP),new THREE.MeshLambertMaterial({map:wallTex}));o.position.y=.31;
  const i=new THREE.Mesh(new THREE.CylinderGeometry(3.32,3.32,.62,72,1,true,Math.PI+GAP/2,2*Math.PI-GAP),new THREE.MeshLambertMaterial({map:wallTex,side:THREE.BackSide}));i.position.y=.31;
  const rail=new THREE.Mesh(new THREE.RingGeometry(3.3,3.48,72,1,Math.PI/2+GAP/2,2*Math.PI-GAP).rotateX(-Math.PI/2),dark);rail.position.y=.625;scene.add(o,i,rail);
  for(const s of [-1,1]){const pp=at(s*GAPD,3.39),post=new THREE.Mesh(new THREE.BoxGeometry(.16,.7,.16),dark);post.position.set(pp.x,.35,pp.z);post.lookAt(0,.35,0);scene.add(post)}}
 for(let k=0;k<10;k++){const t=GAPD+k*(360-2*GAPD)/9,d=at(t,1);const P=(r,y)=>V(d.x*r,y,d.z*r);scene.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CubicBezierCurve3(P(3.39,.6),P(3.39,2.7),P(2.1,4.5),P(.16,4.62)),26,.045,6),ribWood))}
 {const crown=new THREE.Mesh(new THREE.TorusGeometry(.16,.05,8,24).rotateX(Math.PI/2),ribWood);crown.position.y=4.6;scene.add(crown)}
 const lantern=new THREE.Group();{const glass=new THREE.Mesh(new THREE.CylinderGeometry(.11,.11,.22,10),new THREE.MeshBasicMaterial({color:0xffcf8a,transparent:true,opacity:.85}));const cap=new THREE.Mesh(new THREE.ConeGeometry(.15,.1,10),dark);cap.position.y=.16;const bottom=new THREE.Mesh(new THREE.CylinderGeometry(.13,.13,.03,10),dark);bottom.position.y=-.125;const cord=new THREE.Mesh(new THREE.CylinderGeometry(.006,.006,1.1,4),dark);cord.position.y=.75;lantern.add(glass,cap,bottom,cord,sprite(GLOW_WARM,.9,0xffc27a,.5))}
 lantern.position.set(0,3.4,0);scene.add(lantern);
 const rugTex=canvasTex(1024,1024,g=>{const cx=512,ring=(r,col)=>{g.fillStyle=col;g.beginPath();g.arc(cx,cx,r,0,7);g.fill()};ring(510,'#6c3a30');ring(470,'#b48f55');ring(450,'#7b4436');for(let i=0;i<48;i++){const a=i/48*6.283;g.fillStyle=i%2?'#cdb072':'#a05c46';g.beginPath();g.arc(cx+Math.cos(a)*400,cx+Math.sin(a)*400,26,0,7);g.fill()}ring(340,'#553246');for(let i=0;i<16;i++){const a=i/16*6.283;g.fillStyle='#c29d63';g.beginPath();g.moveTo(cx,cx);g.arc(cx,cx,320,a,a+.12);g.fill()}ring(200,'#7b4436');ring(170,'#cdb072');ring(140,'#6c3a30');for(let i=0;i<8;i++){const a=i/8*6.283;g.fillStyle='#e0caa0';g.beginPath();g.ellipse(cx+Math.cos(a)*90,cx+Math.sin(a)*90,40,16,a,0,7);g.fill()}ring(34,'#e0caa0');for(let y=0;y<1024;y+=4){g.fillStyle='rgba(0,0,0,'+(y%8?.07:.13)+')';g.fillRect(0,y,1024,1.4)}for(let x=0;x<1024;x+=4){g.fillStyle='rgba(255,240,215,'+(x%8?.035:.06)+')';g.fillRect(x,0,1.3,1024)}for(let k=0;k<9000;k++){g.fillStyle='rgba('+(Math.random()<.5?'0,0,0,':'255,240,220,')+(Math.random()*.08).toFixed(3)+')';g.fillRect(Math.random()*1024,Math.random()*1024,2,2)}});
 {const rug=new THREE.Mesh(new THREE.CircleGeometry(1.3,72).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:rugTex}));rug.position.y=.006;scene.add(rug)}
 /* The floor gets darker where it meets the wall (as light does in a real room). */
 {const pos=[],col=[],idx=[],n=96,r0=2.86,r1=3.33;for(let i=0;i<=n;i++){const a=at(GAPD+i*(360-2*GAPD)/n,1);pos.push(a.x*r0,.008,a.z*r0,a.x*r1,.008,a.z*r1);col.push(0,0,0,0,.04,.02,0,.48)}
  for(let i=0;i<n;i++){const k=i*2;idx.push(k,k+1,k+2,k+1,k+3,k+2)}const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));geo.setAttribute('color',new THREE.Float32BufferAttribute(col,4));geo.setIndex(idx);
  const m=new THREE.Mesh(geo,new THREE.MeshBasicMaterial({vertexColors:true,transparent:true,depthWrite:false,fog:false,side:THREE.DoubleSide}));m.renderOrder=1;scene.add(m)}
 /* Floor cushions: woven cloth, a tufted centre with a button, piping round the edge. */
 const fabricTex=canvasTex(256,256,g=>{g.fillStyle='#fff';g.fillRect(0,0,256,256);for(let y=0;y<256;y+=3){g.fillStyle='rgba(0,0,0,'+(.05+.05*Math.random()).toFixed(3)+')';g.fillRect(0,y,256,1)}for(let x=0;x<256;x+=3){g.fillStyle='rgba(0,0,0,'+(.03+.04*Math.random()).toFixed(3)+')';g.fillRect(x,0,1,256)}});
 fabricTex.wrapS=fabricTex.wrapT=THREE.RepeatWrapping;fabricTex.repeat.set(10,3);
 const cushionGeo=new THREE.LatheGeometry([[.001,0],[.19,.002],[.285,.014],[.33,.05],[.342,.095],[.328,.138],[.28,.178],[.19,.19],[.07,.18],[.001,.168]].map(([x,y])=>new THREE.Vector2(x,y)),40);
 for(const [t,col] of [[180,0x8e4a3a],[242,0x6a3d55],[118,0x5d6a40]]){const p=at(t,1.6),c=new THREE.Color(col),mat=new THREE.MeshLambertMaterial({color:c,map:fabricTex}),m=new THREE.Mesh(cushionGeo,mat);m.position.set(p.x,0,p.z);m.rotation.y=t;
  const pipe=new THREE.Mesh(new THREE.TorusGeometry(.338,.009,6,48).rotateX(Math.PI/2),new THREE.MeshLambertMaterial({color:c.clone().multiplyScalar(.7)}));pipe.position.y=.096;m.add(pipe);
  const knob=new THREE.Mesh(new THREE.SphereGeometry(.02,10,6),new THREE.MeshLambertMaterial({color:c.clone().multiplyScalar(.6)}));knob.position.y=.17;knob.scale.y=.6;m.add(knob);scene.add(m);shadow(p.x,p.z,.46)}
 for(const t of [188,172]){const p=at(t,2.85),pot=new THREE.Mesh(new THREE.CylinderGeometry(.2,.15,.36,16),new THREE.MeshLambertMaterial({color:0xa0522d}));pot.position.set(p.x,.18,p.z);scene.add(pot);shadow(p.x,p.z,.34);for(let k=0;k<9;k++){const leaf=new THREE.Mesh(new THREE.SphereGeometry(.09,8,6),new THREE.MeshLambertMaterial({color:new THREE.Color().setHSL(.29,.45,R(.22,.32),THREE.SRGBColorSpace)}));leaf.scale.set(1,R(2.6,4),.5);const la=rnd()*6.283;leaf.position.set(p.x+Math.cos(la)*.08,.5+R(0,.2),p.z+Math.sin(la)*.08);leaf.rotation.set(R(-.6,.6),la,R(-.6,.6));scene.add(leaf)}}
 /* Candles: on the rail, on the tarot table, on the altar. The flames flicker; three warm lights fill the room. */
 const flames=[];
 function candle(x,y,z,h=R(.09,.2),r=R(.025,.04)){const b=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),new THREE.MeshLambertMaterial({color:0xf3e6cc}));b.position.set(x,y+h/2,z);scene.add(b);const f=sprite(GLOW_WARM,.11,0xffd28a,.95);f.position.set(x,y+h+.035,z);f.userData={base:.11,ph:rnd()*99};scene.add(f);flames.push(f)}
 for(const t of [50,83,115,148,180,-148,-115,-83,-50]){const p=at(t,3.39);candle(p.x,.63,p.z)}
 const lights={lantern:new THREE.PointLight(0xffb366,2,12,1.5),tarot:new THREE.PointLight(0xffb06a,1,5,1.6),altar:new THREE.PointLight(0xffa860,1,5,1.6)};
 lights.lantern.position.set(0,3.1,0);scene.add(lights.lantern);
 const hemi=new THREE.HemisphereLight(0xdbe8fa,0x5a5440,1),sunLight=new THREE.DirectionalLight(0xffffff,1.4),moonLight=new THREE.DirectionalLight(0x9fb4ff,0);scene.add(hemi,sunLight,sunLight.target,moonLight,moonLight.target);
 /* Warm candlelight falling on the floor below the candles on the rail, at dusk and at night. */
 const poolMat=new THREE.MeshBasicMaterial({map:GLOW_WARM,color:0xff9a50,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false});
 for(const t of [50,83,115,148,180,-148,-115,-83,-50]){const p=at(t,3.02),m=new THREE.Mesh(shadowGeo,poolMat);m.position.set(p.x,.011,p.z);m.scale.set(1.1,1,1.1);m.renderOrder=2;scene.add(m)}
 /* A string of small lights hanging between the ribs of the dome; it glows from dusk on. Not across the open front. */
 const garland={bulbs:null,glow:null};
 {const ribAt=k=>{const d=at(GAPD+k*(360-2*GAPD)/9,1),c=new THREE.CubicBezierCurve3(V(d.x*3.39,.6,d.z*3.39),V(d.x*3.39,2.7,d.z*3.39),V(d.x*2.1,4.5,d.z*2.1),V(d.x*.16,4.62,d.z*.16));let lo=0,hi=1;for(let i=0;i<30;i++){const m=(lo+hi)/2;if(c.getPoint(m).y<2.48)lo=m;else hi=m}return c.getPoint(lo)};
  const pts=[],wire=[],tmp=V();
  for(let k=0;k<9;k++){const A=ribAt(k),B=ribAt(k+1),n=11;let prev=A.clone();for(let i=1;i<=n;i++){const s=i/(n+1);tmp.lerpVectors(A,B,s);tmp.y-=.26*4*s*(1-s);pts.push(tmp.clone());wire.push(prev.x,prev.y,prev.z,tmp.x,tmp.y,tmp.z);prev=tmp.clone()}wire.push(prev.x,prev.y,prev.z,B.x,B.y,B.z)}
  const bulbs=new THREE.InstancedMesh(new THREE.SphereGeometry(.014,8,6),new THREE.MeshBasicMaterial({color:0x6b5a3a}),pts.length),M=new THREE.Matrix4();pts.forEach((p,i)=>{M.makeTranslation(p.x,p.y-.018,p.z);bulbs.setMatrixAt(i,M)});scene.add(bulbs);
  const wg=new THREE.BufferGeometry();wg.setAttribute('position',new THREE.Float32BufferAttribute(wire,3));scene.add(new THREE.LineSegments(wg,new THREE.LineBasicMaterial({color:0x2a1a10,transparent:true,opacity:.7})));
  const gg=new THREE.BufferGeometry();gg.setAttribute('position',new THREE.Float32BufferAttribute(pts.flatMap(p=>[p.x,p.y-.018,p.z]),3));
  const glow=new THREE.Points(gg,new THREE.PointsMaterial({map:GLOW_WARM,size:.11,color:0xffc070,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));glow.frustumCulled=false;scene.add(glow);
  garland.bulbs=bulbs;garland.glow=glow}
 /* ---------- Panels and buttons: text drawn on canvases ---------- */
 const PPM=1400;
 function wrap(g,text,max){const out=[];for(const para of String(text??'').split('\n')){let line='';for(const w of para.split(' ')){const t=line?line+' '+w:w;if(line&&g.measureText(t).width>max){out.push(line);line=w}else line=t;while(g.measureText(line).width>max&&line.length>1){let k=line.length-1;while(k>1&&g.measureText(line.slice(0,k)).width>max)k--;out.push(line.slice(0,k));line=line.slice(k)}}out.push(line)}return out}
 function rr(g,x,y,w,h,r){g.beginPath();g.moveTo(x+r,y);g.arcTo(x+w,y,x+w,y+h,r);g.arcTo(x+w,y+h,x,y+h,r);g.arcTo(x,y+h,x,y,r);g.arcTo(x,y,x+w,y,r);g.closePath()}
 function panel(w,h,ppm=PPM){const t=canvasTex(Math.round(w*ppm),Math.round(h*ppm));const m=new THREE.Mesh(new THREE.PlaneGeometry(w,h),new THREE.MeshBasicMaterial({map:t,transparent:true,depthWrite:false,fog:false}));m.renderOrder=5;
  m.userData.draw=fn=>{const c=t.userData.canvas,g=c.getContext('2d');g.clearRect(0,0,c.width,c.height);g.textAlign='left';g.textBaseline='alphabetic';fn(g,c.width,c.height);t.needsUpdate=true};return m}
 function infoPanel(w,h){const m=panel(w,h);m.userData.set=o=>m.userData.draw((g,W,H)=>{
  g.fillStyle='rgba(36,23,15,.9)';rr(g,0,0,W,H,36);g.fill();g.strokeStyle='rgba(233,184,114,.5)';g.lineWidth=4;rr(g,8,8,W-16,H-16,30);g.stroke();
  const pad=50;let y=pad+20;
  if(o.kicker){g.fillStyle='#dcb67e';g.font='700 27px '+FONT;g.fillText(o.kicker.toUpperCase(),pad,y);y+=54}
  if(o.title){g.fillStyle='#fbe8c6';g.font='800 48px '+FONT;for(const l of wrap(g,o.title,W-pad*2).slice(0,3)){g.fillText(l,pad,y);y+=56}y+=12}
  for(const [head,text] of o.lines||[]){if(y>H-70)break;if(head){g.fillStyle='#dcb67e';g.font='700 25px '+FONT;g.fillText(head.toUpperCase(),pad,y);y+=38}g.fillStyle='#f3dfbd';g.font='400 33px '+FONT;for(const l of wrap(g,text,W-pad*2)){if(y>H-36)break;g.fillText(l,pad,y);y+=42}y+=16}
  if(o.body){g.fillStyle='#f3dfbd';g.font='400 33px '+FONT;for(const l of wrap(g,o.body,W-pad*2)){if(y>H-36)break;g.fillText(l,pad,y);y+=42}}});return m}
 /* Line icons for the desk, drawn on the canvas (no image files). */
 function icon(g,name,cx,cy,size,col){const S=size/2,P=()=>g.beginPath(),st=()=>g.stroke(),L=(x1,y1,x2,y2)=>{P();g.moveTo(x1*S,y1*S);g.lineTo(x2*S,y2*S);st()};
  g.save();g.translate(cx,cy);g.strokeStyle=col;g.fillStyle=col;g.lineWidth=Math.max(1.5,size*.085);g.lineCap='round';g.lineJoin='round';
  const wave=(y,a=.18,n=2)=>{P();for(let i=0;i<=24;i++){const x=-.85+1.7*i/24;g[i?'lineTo':'moveTo'](x*S,(y+Math.sin(i/24*n*2*Math.PI)*a)*S)}st()};
  switch(name){
   case 'jetzt':P();g.arc(0,0,S*.82,0,7);st();L(0,0,0,-.52);L(0,0,.36,.14);break;
   case 'morgen':L(-.95,.5,.95,.5);P();g.arc(0,.5*S,S*.46,Math.PI,0);st();for(const a of [-2.55,-2,-1.57,-1.14,-.6]){const c=Math.cos(a),n=Math.sin(a);L(c*.66,.5+n*.66,c*.9,.5+n*.9)}break;
   case 'tag':P();g.arc(0,0,S*.36,0,7);st();for(let i=0;i<8;i++){const a=i*Math.PI/4;L(Math.cos(a)*.58,Math.sin(a)*.58,Math.cos(a)*.88,Math.sin(a)*.88)}break;
   case 'abend':L(-.95,.18,.95,.18);P();g.arc(0,.18*S,S*.5,Math.PI,0);st();L(-.6,.52,.6,.52);L(-.32,.82,.32,.82);break;
   case 'nacht':{const R1=.66,cx2=.34,cy2=-.22,R2=.54,d=Math.hypot(cx2,cy2),a=(R1*R1-R2*R2+d*d)/(2*d),h=Math.sqrt(Math.max(0,R1*R1-a*a)),ux=cx2/d,uy=cy2/d,p1=[a*ux-h*uy,a*uy+h*ux],p2=[a*ux+h*uy,a*uy-h*ux];
    P();g.arc(0,0,R1*S,Math.atan2(p1[1],p1[0]),Math.atan2(p2[1],p2[0]),false);g.arc(cx2*S,cy2*S,R2*S,Math.atan2(p2[1]-cy2,p2[0]-cx2),Math.atan2(p1[1]-cy2,p1[0]-cx2),true);g.closePath();g.fill();
    P();g.arc(.58*S,.42*S,S*.07,0,7);g.fill();break}
   case 'still':P();g.moveTo(-.62*S,-.2*S);g.lineTo(-.36*S,-.2*S);g.lineTo(-.04*S,-.52*S);g.lineTo(-.04*S,.52*S);g.lineTo(-.36*S,.2*S);g.lineTo(-.62*S,.2*S);g.closePath();st();L(.24,-.26,.68,.26);L(.68,-.26,.24,.26);break;
   case 'meer':wave(-.2,.16,2);wave(.26,.16,2);break;
   case 'regen':P();g.arc(-.28*S,-.18*S,S*.3,Math.PI*.9,Math.PI*1.9);g.arc(.12*S,-.32*S,S*.36,Math.PI*1.1,Math.PI*1.95);g.arc(.48*S,-.08*S,S*.26,Math.PI*1.5,Math.PI*.45);g.lineTo(-.5*S,.1*S);g.closePath();st();L(-.36,.36,-.46,.66);L(0,.36,-.1,.66);L(.36,.36,.26,.66);break;
   case 'rauschen':{const ys=[0,-.5,.34,-.22,.6,-.62,.12,-.3,.46,-.1,0];P();ys.forEach((y,i)=>g[i?'lineTo':'moveTo']((-.85+1.7*i/(ys.length-1))*S,y*S));st();break}
   case 'drone':wave(0,.32,1.5);L(-.85,.66,.85,.66);break;
   case 'tafel':P();g.rect(-.72*S,-.62*S,1.44*S,.86*S);st();L(-.5,.24,-.66,.84);L(.5,.24,.66,.84);L(-.4,-.3,.36,-.3);L(-.4,-.04,.12,-.04);break;
   case 'stapel':for(const [dx,dy,r] of [[-.16,.12,-.18],[0,0,0],[.14,-.12,.16]]){g.save();g.translate(dx*S,dy*S);g.rotate(r);P();rr(g,-.36*S,-.5*S,.72*S,1*S,.1*S);g.fillStyle='rgba(0,0,0,.25)';g.fill();st();g.restore()}break;
   case 'tarot':P();rr(g,-.42*S,-.7*S,.84*S,1.4*S,.12*S);st();P();for(let i=0;i<10;i++){const r=i%2?.14:.34,a=-Math.PI/2+i*Math.PI/5;g[i?'lineTo':'moveTo'](Math.cos(a)*r*S,(Math.sin(a)*r-.04)*S)}g.closePath();g.fill();break;
   case 'sigillen':P();g.arc(0,0,S*.8,0,7);st();P();g.moveTo(-.42*S,.42*S);g.quadraticCurveTo(-.1*S,-.7*S,.18*S,-.1*S);g.quadraticCurveTo(.36*S,.3*S,.5*S,-.42*S);st();P();g.arc(-.42*S,.42*S,S*.09,0,7);st();L(.36,-.56,.64,-.28);break;
   case 'schale':P();g.ellipse(0,.02*S,.78*S,.18*S,0,0,7);st();P();g.moveTo(-.78*S,.02*S);g.quadraticCurveTo(-.7*S,.72*S,0,.72*S);g.quadraticCurveTo(.7*S,.72*S,.78*S,.02*S);st();P();g.arc(0,.02*S,S*.98,-2.5,-.64);st();break;
   case 'buch':P();g.moveTo(0,-.4*S);g.quadraticCurveTo(-.4*S,-.62*S,-.86*S,-.46*S);g.lineTo(-.86*S,.5*S);g.quadraticCurveTo(-.4*S,.34*S,0,.56*S);g.quadraticCurveTo(.4*S,.34*S,.86*S,.5*S);g.lineTo(.86*S,-.46*S);g.quadraticCurveTo(.4*S,-.62*S,0,-.4*S);g.lineTo(0,.56*S);st();break;
   case 'atem':P();g.arc(0,0,S*.3,0,7);st();g.globalAlpha=.55;P();g.arc(0,0,S*.62,0,7);st();g.globalAlpha=.28;P();g.arc(0,0,S*.9,0,7);st();break;
   case 'weniger':P();g.arc(0,0,S*.78,0,7);st();L(-.4,0,.4,0);break;
   case 'verlassen':P();g.moveTo(.2*S,-.5*S);g.lineTo(.2*S,-.78*S);g.lineTo(-.7*S,-.78*S);g.lineTo(-.7*S,.78*S);g.lineTo(.2*S,.78*S);g.lineTo(.2*S,.5*S);st();L(-.18,0,.84,0);L(.58,-.26,.84,0);L(.58,.26,.84,0);break;
  }g.restore()}
 /* Buttons: a little relief (lighter top, darker bottom edge) and, when pressed, a short movement into the surface. */
 const pressing=new Set();
 function pressAnim(m){const u=m.userData;if(u.pressT==null)u.baseZ=m.position.z;u.pressT=performance.now();pressing.add(m)}
 function button(label,w,h,onSelect,ppm=PPM,ic=''){const m=panel(w,h,ppm),u=m.userData;u.label=label;u.icon=ic;u.active=false;u.hover=false;u.onSelect=hit=>{pressAnim(m);onSelect(hit)};
  u.paint=()=>u.draw((g,W,H)=>{const r=Math.min(W,H)*.3,lw=Math.max(2,Math.round(H*.05)),gr=g.createLinearGradient(0,0,0,H);
   gr.addColorStop(0,u.active?'#f2c682':u.hover?'#83573a':'#46301f');gr.addColorStop(1,u.active?'#c98d48':u.hover?'#5c3b25':'#26180f');g.fillStyle=gr;rr(g,0,0,W,H,r);g.fill();
   g.fillStyle='rgba(255,246,228,'+(u.active?.28:.08)+')';rr(g,H*.07,H*.06,W-H*.14,H*.15,r*.5);g.fill();
   g.strokeStyle=u.active?'rgba(255,241,214,.95)':'rgba(233,184,114,'+(u.hover?.95:.42)+')';g.lineWidth=lw;rr(g,lw/2+1,lw/2+1,W-lw-2,H-lw-2,Math.max(2,r-lw));g.stroke();
   const ink=u.active?'#2c1a10':'#fbe8c6';g.fillStyle=ink;g.textAlign='center';g.textBaseline='middle';
   if(u.icon){icon(g,u.icon,W/2,H*.4,H*.44,ink);let fs=Math.round(H*.2);g.font='700 '+fs+'px '+FONT;while(fs>8&&g.measureText(u.label).width>W*.9){fs--;g.font='700 '+fs+'px '+FONT}g.fillStyle=ink;g.fillText(u.label,W/2,H*.81)}
   else{let fs=Math.round(H*.44);g.font='700 '+fs+'px '+FONT;while(fs>12&&g.measureText(u.label).width>W*.84){fs--;g.font='700 '+fs+'px '+FONT}g.fillText(u.label,W/2,H/2+2)}});
  u.setLabel=l=>{if(u.label!==l){u.label=l;u.paint()}};u.setActive=a=>{if(u.active!==a){u.active=a;u.paint()}};u.setHover=hv=>{if(u.hover!==hv){u.hover=hv;u.paint()}};
  u.paint();hits.push(m);return m}
 function row(group,defs,y,{w=.12,h=.05,gap=.012,z=0,ppm=PPM}={}){const total=defs.reduce((a,d)=>a+(d[2]||w),0)+gap*(defs.length-1);let x=-total/2;return defs.map(([label,fn,bw,ic])=>{bw=bw||w;const b=button(label,bw,h,fn,ppm,ic);b.position.set(x+bw/2,y,z);x+=bw+gap;group.add(b);return b})}
 const facing=(obj,x,y,z,eyeY=1.35)=>{obj.position.set(x,y,z);obj.lookAt(0,eyeY,0);return obj};
 /* Something to place right in front of the viewer (book, writing surface, messages). */
 function fitDist(w,h){const vf=70*RAD,hf=2*Math.atan(Math.tan(vf/2)*camera.aspect);return Math.max(w/2/Math.tan(hf/2),h/2/Math.tan(vf/2))*1.08}
 function frontPose(dist,drop,tilt=-.15){const c=renderer.xr.isPresenting?renderer.xr.getCamera():camera;c.getWorldPosition(tV);c.getWorldDirection(tV2);tV2.y=0;if(tV2.lengthSq()<1e-4)tV2.set(0,0,-1);tV2.normalize();
  const o=new THREE.Object3D();o.rotation.order='YXZ';o.position.copy(tV).addScaledVector(tV2,dist);o.position.y=tV.y-drop;o.rotation.set(tilt,Math.atan2(-tV2.x,-tV2.z),0);return o}
 const place=(obj,pose,scale=1)=>{obj.position.copy(pose.position);obj.quaternion.setFromEuler(pose.rotation);obj.scale.setScalar(scale)};
 /* Messages: the app's toasts are mirrored in VR, where the page itself cannot be seen. */
 const note=panel(.62,.07);note.visible=false;scene.add(note);let noteUntil=0;
 function say(text,ms=3500){if(!presenting()){toast(text);return}note.userData.draw((g,W,H)=>{g.fillStyle='rgba(36,23,15,.92)';rr(g,0,0,W,H,H/2);g.fill();let fs=Math.round(H*.42);g.font='600 '+fs+'px '+FONT;while(fs>12&&g.measureText(text).width>W*.92){fs--;g.font='600 '+fs+'px '+FONT}g.fillStyle='#fbe8c6';g.textAlign='center';g.textBaseline='middle';g.fillText(text,W/2,H/2+2)});place(note,frontPose(.7,.32,-.3));note.visible=true;noteUntil=performance.now()+ms}
 const toastEl=document.getElementById('toast'),toastObs=toastEl?new MutationObserver(()=>{if(presenting()&&toastEl.classList.contains('show')){const s=toastEl.querySelector('span');if(s&&s.textContent)say(s.textContent)}}):null;
 toastObs?.observe(toastEl,{childList:true,subtree:true,attributes:true,attributeFilter:['class']});
 /* ---------- Desk in front: sky, sound, the stations, notebook, breath, less, leave ---------- */
 const pult=new THREE.Group();pult.position.set(0,0,-1.25);pult.lookAt(0,0,0);scene.add(pult);
 {const base=new THREE.Mesh(new THREE.CylinderGeometry(.21,.25,.04,24),dark);base.position.y=.02;const post=new THREE.Mesh(new THREE.CylinderGeometry(.035,.045,.72,10),dark);post.position.set(0,.38,-.05);
  const deskTex=canvasTex(512,512,g=>{g.fillStyle='#5d3b24';g.fillRect(0,0,512,512);for(let i=0;i<90;i++){g.strokeStyle='rgba('+(20+Math.random()*40|0)+','+(10+Math.random()*20|0)+',6,'+(.1+Math.random()*.22).toFixed(2)+')';g.lineWidth=1+Math.random()*2.5;g.beginPath();const y=Math.random()*512;g.moveTo(0,y);g.bezierCurveTo(170,y+(Math.random()-.5)*24,340,y+(Math.random()-.5)*24,512,y+(Math.random()-.5)*16);g.stroke()}});
  const board=new THREE.Mesh(new THREE.BoxGeometry(.86,.56,.03),new THREE.MeshLambertMaterial({map:deskTex}));board.position.set(0,.86,0);board.rotation.x=-.5;pult.add(base,post,board);shadow(0,-1.25,.46,.38)}
 const pultPanel=new THREE.Group();pultPanel.position.set(0,.86+.479*.02,.878*.02);pultPanel.rotation.x=-.5;pult.add(pultPanel);
 const pultInfo=panel(.8,.058);pultInfo.position.y=.173;pultPanel.add(pultInfo);
 const TW=.136,TO={h:.074,gap:.011,ppm:2000},SKY_ICON={echt:'jetzt',morgen:'morgen',tag:'tag',abend:'abend',nacht:'nacht'},SOUND_ICON={'':'still',sea:'meer',rain:'regen',brown:'rauschen',drone:'drone'};
 const timeBtns=row(pultPanel,RAUM_TIMES.map(([k,l])=>[l,()=>{setTime(k);save();raumControls()},TW,SKY_ICON[k]]),.084,TO);timeBtns.forEach((b,i)=>b.userData.key=RAUM_TIMES[i][0]);
 const soundBtns=row(pultPanel,RAUM_SOUNDS.map(([k,l])=>[l,()=>{setSound(k);save();raumControls()},TW,SOUND_ICON[k]]),.001,TO);soundBtns.forEach((b,i)=>b.userData.key=RAUM_SOUNDS[i][0]);
 row(pultPanel,[['Tafel',()=>goStation('tag'),TW,'tafel'],['Stapel',()=>goStation('stapel'),TW,'stapel'],['Tarot',()=>goStation('tarot'),TW,'tarot'],['Sigillen',()=>goStation('sigil'),TW,'sigillen'],['Schale',()=>goStation('schale'),TW,'schale']],-.082,TO);
 const toolBtns=row(pultPanel,[['Notizbuch',()=>openBook(),.17,'buch'],['Atemkugel',()=>{setBreath(!prefs.breath);save();raumControls()},.17,'atem'],['Weniger',()=>toggleCalm(),.17,'weniger'],['Verlassen',()=>renderer.xr.getSession()?.end(),.17,'verlassen']],-.165,TO),[,breathBtn,calmBtn,leaveBtn]=toolBtns;
 function centerTools(){const vis=toolBtns.filter(b=>b.visible),w=.17,g=.011;let x=-(vis.length*w+(vis.length-1)*g)/2;for(const b of vis){b.position.x=x+w/2;x+=w+g}}
 /* ---------- Breathing orb: four counts in, six out ---------- */
 const orb=new THREE.Group(),orbBall=new THREE.Mesh(new THREE.SphereGeometry(.1,32,16),new THREE.MeshBasicMaterial({color:0xfff3e0,transparent:true,opacity:.85})),orbHalo=sprite(GLOW_SOFT,.4,0xffd9a8,.5);orb.add(orbBall,orbHalo);
 const orbLabel=panel(.3,.055);orbLabel.position.set(0,-.13,0);orb.add(orbLabel);let orbWord='',orbFade=1;
 orb.position.set(0,1.2,-1.75);orb.lookAt(0,1.35,0);scene.add(orb);
 /* ---------- Tarot corner (left) ---------- */
 const TAR=at(83,2.2);
 {const top=new THREE.Mesh(new THREE.CylinderGeometry(.44,.44,.04,40),dark);top.position.set(TAR.x,.7,TAR.z);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.05,.07,.68,10),dark);leg.position.set(TAR.x,.35,TAR.z);const foot=new THREE.Mesh(new THREE.CylinderGeometry(.24,.26,.03,24),dark);foot.position.set(TAR.x,.015,TAR.z);
  const clothTex=canvasTex(512,512,g=>{g.fillStyle='#3b1f4f';g.beginPath();g.arc(256,256,256,0,7);g.fill();g.strokeStyle='#d9b36b';g.lineWidth=10;g.beginPath();g.arc(256,256,236,0,7);g.stroke();g.lineWidth=3;g.beginPath();g.arc(256,256,214,0,7);g.stroke();for(let i=0;i<12;i++){const a=i/12*6.283;g.fillStyle='#d9b36b';g.beginPath();g.arc(256+Math.cos(a)*225,256+Math.sin(a)*225,6,0,7);g.fill()}});
  const cloth=new THREE.Mesh(new THREE.CircleGeometry(.43,40).rotateX(-Math.PI/2),new THREE.MeshLambertMaterial({map:clothTex}));cloth.position.set(TAR.x,.722,TAR.z);scene.add(top,leg,foot,cloth);shadow(TAR.x,TAR.z,.62);
  for(const [dx,dz,h] of [[.28,-.15,.12],[.3,.05,.17],[-.25,.22,.09]])candle(TAR.x+dx,.722,TAR.z+dz,h);
  lights.tarot.position.set(TAR.x*.9,1.15,TAR.z*.9);scene.add(lights.tarot);
  const cushion=new THREE.Mesh(new THREE.SphereGeometry(.3,24,12),new THREE.MeshLambertMaterial({color:0x5c2a3e}));cushion.scale.set(1,.3,1);cushion.position.set(TAR.x*.62,.09,TAR.z*.62);scene.add(cushion)}
 const cardBack=canvasTex(512,860,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#5a1c2c');gr.addColorStop(1,'#2a0c18');g.fillStyle=gr;rr(g,0,0,W,H,36);g.fill();g.strokeStyle='#d9b36b';g.lineWidth=8;rr(g,22,22,W-44,H-44,24);g.stroke();g.lineWidth=3;rr(g,40,40,W-80,H-80,18);g.stroke();g.save();g.translate(W/2,H/2);for(let r=60;r<=200;r+=46){g.beginPath();g.arc(0,0,r,0,7);g.stroke()}for(let i=0;i<16;i++){g.rotate(Math.PI/8);g.beginPath();g.moveTo(0,40);g.lineTo(0,220);g.stroke()}g.fillStyle='#d9b36b';g.beginPath();for(let i=0;i<16;i++){const r=i%2?22:54,a=i/16*6.283;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.restore()});
 const faceCache=new Map();
 function emblem(g,suit,cx,cy,s){g.strokeStyle='#e9c47e';g.fillStyle='#e9c47e';g.lineWidth=s*.06;g.lineCap='round';
  if(suit==='staebe'){g.beginPath();g.moveTo(cx-s*.25,cy+s*.6);g.lineTo(cx+s*.25,cy-s*.6);g.stroke();for(const t of [-.3,0,.3]){g.beginPath();g.ellipse(cx+t*s*.42+s*.08,cy-t*s-s*.05,s*.07,s*.14,.6,0,7);g.fill()}}
  else if(suit==='kelche'){g.beginPath();g.moveTo(cx-s*.42,cy-s*.45);g.quadraticCurveTo(cx-s*.42,cy+s*.15,cx,cy+s*.18);g.quadraticCurveTo(cx+s*.42,cy+s*.15,cx+s*.42,cy-s*.45);g.stroke();g.beginPath();g.moveTo(cx,cy+s*.18);g.lineTo(cx,cy+s*.5);g.moveTo(cx-s*.22,cy+s*.55);g.lineTo(cx+s*.22,cy+s*.55);g.stroke()}
  else if(suit==='schwerter'){g.beginPath();g.moveTo(cx,cy-s*.7);g.lineTo(cx,cy+s*.42);g.stroke();g.beginPath();g.moveTo(cx-s*.3,cy+s*.28);g.lineTo(cx+s*.3,cy+s*.28);g.stroke();g.beginPath();g.arc(cx,cy+s*.56,s*.08,0,7);g.fill()}
  else{g.beginPath();g.arc(cx,cy,s*.55,0,7);g.stroke();g.beginPath();for(let i=0;i<=5;i++){const a=-Math.PI/2+i*4*Math.PI/5;g.lineTo(cx+Math.cos(a)*s*.48,cy+Math.sin(a)*s*.48)}g.stroke()}}
 function cardFace(i){if(faceCache.has(i))return faceCache.get(i);const c=PulseLibrary.TAROT[i];
  const t=canvasTex(512,860,(g,W,H)=>{const gr=g.createLinearGradient(0,0,0,H);gr.addColorStop(0,'#2e1a4c');gr.addColorStop(1,'#140a26');g.fillStyle=gr;rr(g,0,0,W,H,36);g.fill();g.strokeStyle='#d9b36b';g.lineWidth=8;rr(g,22,22,W-44,H-44,24);g.stroke();g.lineWidth=2;rr(g,38,38,W-76,H-76,18);g.stroke();
   g.fillStyle='#e9c47e';g.textAlign='center';g.font='700 40px '+FONT;g.fillText(c.arcana==='major'?toRoman(c.number):String(c.element||'').toUpperCase(),W/2,104);
   if(c.arcana==='major'){const n=8+(c.number%5)*2;g.save();g.translate(W/2,330);g.beginPath();for(let k=0;k<n*2;k++){const r=k%2?40:118,a=k/(n*2)*6.283-Math.PI/2;g.lineTo(Math.cos(a)*r,Math.sin(a)*r)}g.closePath();g.fill();g.strokeStyle='#e9c47e';g.lineWidth=3;g.beginPath();g.arc(0,0,150,0,7);g.stroke();g.restore()}else emblem(g,c.suit,W/2,330,220);
   g.fillStyle='#fbe8c6';g.font='800 46px '+FONT;let y=560;for(const l of wrap(g,c.name,W-90)){g.fillText(l,W/2,y);y+=54}
   g.fillStyle='#d8bfa0';g.font='400 28px '+FONT;y+=8;for(const l of wrap(g,c.keywords.split(' – ')[0],W-100).slice(0,3)){g.fillText(l,W/2,y);y+=36}
   if(c.wildUnknown){g.fillStyle='#b9a3d6';g.font='italic 400 24px '+FONT;g.fillText(c.wildUnknown,W/2,H-64)}});
  faceCache.set(i,t);return t}
 const cardGeo=new THREE.PlaneGeometry(.2,.336);
 const tarot={group:facing(new THREE.Group(),TAR.x*.86,1.3,TAR.z*.86),cards:[]};scene.add(tarot.group);
 const tarotMark=new THREE.Object3D();tarotMark.position.set(.26,-.02,0);tarot.group.add(tarotMark);
 const tarotInfo=infoPanel(.46,.6);tarotInfo.position.set(.62,0,0);tarotInfo.visible=false;tarot.group.add(tarotInfo);
 function tarotCard(i,x,label){const g=new THREE.Group(),pivot=new THREE.Group();g.add(pivot);
  const front=new THREE.Mesh(cardGeo,new THREE.MeshBasicMaterial({map:cardFace(i),fog:false})),back=new THREE.Mesh(cardGeo,new THREE.MeshBasicMaterial({map:cardBack,fog:false}));back.rotation.y=Math.PI;pivot.add(front,back);pivot.rotation.y=Math.PI;
  g.position.set(x,-.08,0);g.userData={pivot,target:Math.PI,rise:0,ph:rnd()*6};front.userData.onSelect=()=>tarotShow(i);back.userData.onSelect=()=>{g.userData.target=0;setTimeout(()=>tarotShow(i),420)};hits.push(front,back);
  if(label){const l=panel(.2,.04);l.userData.draw((c,W,H)=>{c.fillStyle='#e9c98f';c.font='600 '+Math.round(H*.6)+'px '+FONT;c.textAlign='center';c.textBaseline='middle';c.fillText(label,W/2,H/2)});l.position.set(0,-.2,0);g.add(l)}
  tarot.group.add(g);tarot.cards.push(g);return g}
 function tarotClear(){for(const g of tarot.cards){g.traverse(o=>{const k=hits.indexOf(o);if(k>=0)hits.splice(k,1);if(o.userData.draw){o.material.map.dispose();o.material.dispose();o.geometry.dispose()}else if(o.isMesh)o.material.dispose()});tarot.group.remove(g)}tarot.cards=[];tarotInfo.visible=false}
 function tarotShow(i){focusView(tarotMark,fovFor(tarotMark,1.25));const c=PulseLibrary.TAROT[i],mine=(tarotPrefs().tarotNotes||{})[i];tarotInfo.userData.set({kicker:c.arcana==='major'?'Große Arkana':'Kleine Arkana · '+(c.element||''),title:c.name,lines:[['Bedeutung',c.keywords],['Umgekehrt',c.reversed],['Frage',c.question],...(c.wildUnknown?[['The Wild Unknown',c.wildUnknown]]:[]),...(mine?[['Deine Bedeutung',mine]]:[])]});tarotInfo.visible=true}
 function tarotDaily(){focusView(tarotMark,fovFor(tarotMark,1.25));tarotClear();let t=libTodayCard();if(!t){const a=new Uint32Array(1);crypto.getRandomValues(a);if(!lifeSetCard(a[0]%78,'digital'))return;t=libTodayCard()}if(!t)return;const g=tarotCard(t.index,0,'Tageskarte');g.userData.target=0;setTimeout(()=>tarotShow(t.index),500)}
 function tarotThree(){focusView(tarotMark,fovFor(tarotMark,1.25));tarotClear();randomCards(3).forEach((i,k)=>{const g=tarotCard(i,(k-1)*.235,['Was war','Was ist','Was wird'][k]);setTimeout(()=>{g.userData.target=0},350+k*450)})}
 row(tarot.group,[['Tageskarte',tarotDaily,.17],['Drei Karten',tarotThree,.17],['Abräumen',tarotClear,.15]],-.29,{h:.055});
 /* ---------- Sigil corner (right) ---------- */
 const ALT=at(-83,2.2);
 {const altarTex=wallTex.clone();altarTex.repeat.set(1.4,1);altarTex.needsUpdate=true;const stone=new THREE.MeshLambertMaterial({map:altarTex,color:0xd8c0a8}),base=new THREE.Mesh(new THREE.BoxGeometry(.9,.68,.46),stone);base.position.set(ALT.x,.34,ALT.z);base.lookAt(0,.34,0);const slab=new THREE.Mesh(new THREE.BoxGeometry(1.0,.06,.54),dark);slab.position.set(ALT.x,.71,ALT.z);slab.lookAt(0,.71,0);shadow(ALT.x,ALT.z,.66,.42,Math.atan2(-ALT.x,-ALT.z));
  const runnerTex=canvasTex(512,128,g=>{g.fillStyle='#6e1f2a';g.fillRect(0,0,512,128);g.strokeStyle='#d9b36b';g.lineWidth=5;g.strokeRect(12,12,488,104);for(let i=0;i<9;i++){g.beginPath();g.arc(56+i*50,64,10,0,7);g.stroke()}});
  const runner=new THREE.Mesh(new THREE.PlaneGeometry(.92,.22),new THREE.MeshLambertMaterial({map:runnerTex}));runner.position.set(ALT.x,.742,ALT.z);runner.lookAt(0,.742,0);runner.rotateX(-Math.PI/2);scene.add(base,slab,runner);
  for(const [dx,dz,h] of [[-.2,.18,.16],[.05,.24,.2],[.26,-.05,.11]])candle(ALT.x+dx,.74,ALT.z+dz,h);
  const bowl=new THREE.Mesh(new THREE.SphereGeometry(.09,16,8,0,Math.PI*2,Math.PI/2,Math.PI/2),new THREE.MeshLambertMaterial({color:0x8a6a3a,side:THREE.DoubleSide}));bowl.position.set(ALT.x-.12,.83,ALT.z-.12);scene.add(bowl);
  lights.altar.position.set(ALT.x*.9,1.15,ALT.z*.9);scene.add(lights.altar)}
 const sig={group:facing(new THREE.Group(),ALT.x*.86,1.34,ALT.z*.86),items:[],active:null,charge:null,dissolve:[],stamp:''};scene.add(sig.group);
 const sigMark=new THREE.Object3D();sigMark.position.set(-.24,0,0);sig.group.add(sigMark);
 const sigInfo=infoPanel(.46,.42);sigInfo.position.set(-.72,.06,0);sig.group.add(sigInfo);
 const sigBtns=new THREE.Group();sigBtns.position.set(-.72,-.21,0);sig.group.add(sigBtns);
 const ring=new THREE.InstancedMesh(new THREE.SphereGeometry(.007,6,4),new THREE.MeshBasicMaterial({color:0xffffff}),72);
 {const m=new THREE.Matrix4();for(let i=0;i<72;i++){const a=i/72*Math.PI*2;m.makeTranslation(Math.sin(a)*.27,.04+Math.cos(a)*.27,.11);ring.setMatrixAt(i,m);ring.setColorAt(i,C(0x3a2a1a))}}ring.visible=false;sig.group.add(ring);
 const veil=new THREE.Mesh(new THREE.SphereGeometry(9,24,12),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,side:THREE.BackSide,depthWrite:false,fog:false}));veil.renderOrder=-1;scene.add(veil);
 const COL_ON=C(0xffd58a),COL_OFF=C(0x3a2a1a);
 function sigilPoints(d){const out=[],tok=String(d).match(/[MLQ]|-?\d+(?:\.\d+)?/g)||[];let i=0,cx=0,cy=0;
  while(i<tok.length){const c=tok[i++];if(c==='M'||c==='L'){cx=+tok[i++];cy=+tok[i++];out.push([cx,cy])}else if(c==='Q'){const qx=+tok[i++],qy=+tok[i++],x=+tok[i++],y=+tok[i++];for(let k=1;k<=10;k++){const t=k/10,u=1-t;out.push([u*u*cx+2*u*t*qx+t*t*x,u*u*cy+2*u*t*qy+t*t*y])}cx=x;cy=y}else i++}
  return out}
 function sigilMesh(s){const g=PulseSigil.draw(s.letters,{method:s.method,style:s.style,seed:s.seed});if(!g.d)return null;const S=.22,P=([x,y])=>V((x-100)/200*S,(100-y)/200*S,0);
  const pts=sigilPoints(g.d).map(P),grp=new THREE.Group(),mat=new THREE.MeshBasicMaterial({color:0xffd58a,transparent:true,fog:false});
  if(pts.length>1)grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts,false,'catmullrom',.2),Math.max(16,pts.length*3),.0045,6),mat));
  const ringM=new THREE.Mesh(new THREE.TorusGeometry(.012,.004,6,18),mat);ringM.position.copy(P([g.start.x,g.start.y]));grp.add(ringM);
  grp.add(new THREE.Mesh(new THREE.TubeGeometry(new THREE.LineCurve3(P([g.end.x1,g.end.y1]),P([g.end.x2,g.end.y2])),1,.0045,6),mat));
  const halo=sprite(GLOW_WARM,.34,0xffb35a,.3);halo.position.z=-.01;grp.add(halo);
  const pick=new THREE.Mesh(new THREE.CircleGeometry(.13,16),new THREE.MeshBasicMaterial({visible:false}));pick.userData.onSelect=()=>sgFocus(s.id);grp.add(pick);hits.push(pick);
  grp.userData={id:s.id,s,mat,halo,pts,pick,ph:rnd()*6,home:V()};return grp}
 function sgLoad(force){
  const list=PulseSigil.ensure(db).sigils.filter(s=>s.status==='neu'||s.status==='geladen').slice(-5),stamp=list.map(s=>s.id+':'+s.status+':'+s.charges.length).join('|');
  if(!force&&stamp===sig.stamp)return;sig.stamp=stamp;
  const keep=sig.active?.userData.id,old=new Map(sig.items.map(m=>[m.userData.id,m]));
  for(const m of sig.items){const k=hits.indexOf(m.userData.pick);if(k>=0)hits.splice(k,1);sig.group.remove(m);m.traverse(o=>{if(o.isMesh){o.geometry.dispose();o.material.dispose()}})}
  sig.items=[];
  list.forEach((s,k)=>{const m=sigilMesh(s);if(!m)return;m.userData.home.set((k-(list.length-1)/2)*.17,.02+(k%2)*.06,0);const o=old.get(s.id);if(o){m.position.copy(o.position);m.scale.copy(o.scale)}else m.position.copy(m.userData.home);sig.group.add(m);sig.items.push(m)});
  sig.active=keep?sig.items.find(m=>m.userData.id===keep)||null:null;if(!sig.active)sig.charge=null;
  sgMenu()}
 const sigButtons=[];
 function sgButtons(defs){for(const b of sigButtons){const k=hits.indexOf(b);if(k>=0)hits.splice(k,1);sigBtns.remove(b);b.material.map.dispose();b.material.dispose();b.geometry.dispose()}sigButtons.length=0;defs.forEach(([l,fn],k)=>{const b=button(l,.13,.052,fn);b.position.set(((k%3)-(Math.min(defs.length,3)-1)/2)*.145,-Math.floor(k/3)*.064,0);sigBtns.add(b);sigButtons.push(b)})}
 function sgMenu(){
  if(!sig.items.length){sigInfo.userData.set({kicker:'Sigillenecke',title:'Noch keine Sigille',body:'Erschaffe eine in PULSE unter Mehr → Sigillen. Hier schwebt sie dann über dem Altar, und du kannst sie laden und vergessen.'});sgButtons([]);return}
  if(!sig.active){sigInfo.userData.set({kicker:'Sigillenecke',title:sig.items.length===1?'Eine Sigille wartet':sig.items.length+' Sigillen warten',body:'Wähl eine aus, um sie zu laden. Danach kannst du sie vergessen: Sie löst sich in Licht auf.'});sgButtons([]);return}
  const s=sig.active.userData.s;
  if(sig.charge&&!sig.charge.done){sigInfo.userData.set({kicker:'Laden · '+sig.charge.minutes+' Minuten',title:'Bleib bei dem Zeichen',body:'Nicht an den Satz denken. Nur das Zeichen, der Atem, der Ton.'});sgButtons([['Beenden',()=>sgEnd(true)]]);return}
  if(sig.charge&&sig.charge.done){sigInfo.userData.set(sig.charge.ok?{kicker:'Geladen',title:'Jetzt vergessen?',body:'Beim Vergessen löst sich die Sigille in Licht auf. PULSE vermerkt es.'}:{kicker:'Abgebrochen',title:'Nicht geladen',body:'Unter einer Viertelminute zählt PULSE nicht als Ladung.'});sgButtons(sig.charge.ok?[['Vergessen',sgForget],['Behalten',sgBack]]:[['Zurück',sgBack]]);return}
  sigInfo.userData.set({kicker:'Sigille Nr. '+s.no+(s.charges.length?' · '+s.charges.length+'× geladen':''),title:s.intent||'Ohne Satz',body:'Wie lange laden?'});sgButtons([['3 Min',()=>sgStart(3)],['5 Min',()=>sgStart(5)],['10 Min',()=>sgStart(10)],['Zurück',sgBack]]);
 }
 function sgFocus(id){if(sig.charge&&!sig.charge.done)return;focusView(sigMark,fovFor(sigMark,1.45));sig.active=sig.items.find(m=>m.userData.id===id)||null;sig.charge=null;sgMenu()}
 function sgBack(){sig.active=null;sig.charge=null;ring.visible=false;sgMenu()}
 let soundBefore=null;
 function sgStart(minutes){if(!sig.active)return;sig.charge={minutes,start:performance.now(),done:false,ok:false};soundBefore=PulseSoundscape.playing();setSound('drone',true);ring.visible=true;sgMenu()}
 function sgEnd(early){const c=sig.charge;if(!c||c.done)return;c.done=true;const min=Math.min(c.minutes,(performance.now()-c.start)/60000);ring.visible=false;
  if(min>=.25){try{PulseSigil.charge(db,sig.active.userData.id,min,'still',sigilNow());c.ok=true;save()}catch(e){say(e.message)}}
  setSound(soundBefore??'',true);soundBefore=null;if(!early)pulseSound('chime');sgMenu()}
 function sgForget(){const m=sig.active;if(!m)return;try{PulseSigil.forget(db,m.userData.id,sigilNow());save()}catch(e){return say(e.message)}
  m.updateMatrixWorld(true);const wp=m.userData.pts.map(p=>m.localToWorld(p.clone())),pos=[],vel=[];for(let i=0;i<260;i++){const p=wp[Math.floor(rnd()*wp.length)]||m.getWorldPosition(V());pos.push(p.x,p.y,p.z);vel.push(R(-.05,.05),R(.08,.3),R(-.05,.05))}
  const geo=new THREE.BufferGeometry();geo.setAttribute('position',new THREE.Float32BufferAttribute(pos,3));const pts=new THREE.Points(geo,new THREE.PointsMaterial({map:GLOW_WARM,size:.035,color:0xffd28a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));scene.add(pts);sig.dissolve.push({pts,vel,t:0});
  const k=hits.indexOf(m.userData.pick);if(k>=0)hits.splice(k,1);sig.group.remove(m);sig.items=sig.items.filter(x=>x!==m);sig.active=null;sig.charge=null;sgMenu()}
 /* ---------- Notebook: closed on the side table, open in front of you, written into the air ---------- */
 const NB=at(30,1.3);shadow(NB.x,NB.z,.36);
 {const top=new THREE.Mesh(new THREE.CylinderGeometry(.24,.24,.03,32),dark);top.position.set(NB.x,.6,NB.z);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,.58,8),dark);leg.position.set(NB.x,.3,NB.z);const foot=new THREE.Mesh(new THREE.CylinderGeometry(.14,.16,.02,20),dark);foot.position.set(NB.x,.01,NB.z);scene.add(top,leg,foot)}
 const coverTex=canvasTex(256,340,(g,W,H)=>{g.fillStyle='#5a2430';g.fillRect(0,0,W,H);g.strokeStyle='#d9b36b';g.lineWidth=5;g.strokeRect(14,14,W-28,H-28);g.fillStyle='#e9c47e';g.beginPath();g.arc(W/2,H*.4,44,0,7);g.fill();g.fillStyle='#5a2430';g.beginPath();g.arc(W/2+20,H*.4-12,40,0,7);g.fill();g.fillStyle='#e9c47e';g.font='600 26px '+SERIF;g.textAlign='center';g.fillText('Notizbuch',W/2,H*.78)});
 const edge=new THREE.MeshLambertMaterial({color:0xefe4cc}),closedBook=new THREE.Mesh(new THREE.BoxGeometry(.2,.032,.27),[edge,leather,new THREE.MeshLambertMaterial({map:coverTex}),leather,edge,edge]);
 closedBook.position.set(NB.x,.632,NB.z);closedBook.rotation.y=Math.atan2(NB.x,NB.z);closedBook.userData.onSelect=()=>openBook();hits.push(closedBook);scene.add(closedBook);
 const SPW=.57,SPH=.38,spreadTex=canvasTex(1140,760),book=new THREE.Group();book.visible=false;scene.add(book);
 {const back=new THREE.Mesh(new THREE.BoxGeometry(SPW+.03,SPH+.03,.012),leather);back.position.z=-.014;book.add(back);const mat=new THREE.MeshBasicMaterial({map:spreadTex,fog:false});
  for(const side of [0,1]){const g=new THREE.PlaneGeometry(SPW/2,SPH),uv=g.attributes.uv;for(let i=0;i<uv.count;i++)uv.setX(i,uv.getX(i)*.5+side*.5);const m=new THREE.Mesh(g,mat),pivot=new THREE.Group();m.position.x=(side?1:-1)*SPW/4;pivot.rotation.y=side?-.08:.08;pivot.add(m);book.add(pivot)}}
 const turnPrev=button('‹',.06,.07,()=>bookTurn(-1)),turnNext=button('›',.06,.07,()=>bookTurn(1));turnPrev.position.set(-SPW/2-.06,0,0);turnNext.position.set(SPW/2+.06,0,0);book.add(turnPrev,turnNext);
 row(book,[['Schreiben',()=>startWrite(),.17],['Zuklappen',()=>closeBook(),.15]],-SPH/2-.05);
 const bk={view:'closed',spreads:[],index:0,saving:false,confirm:0,stamp:''};
 const mctx=document.createElement('canvas').getContext('2d'),imgCache=new Map();
 function paper(g,W,H){for(const side of [0,1]){const x0=side*W/2,gr=g.createLinearGradient(x0,0,x0+W/2,0);if(side){gr.addColorStop(0,'#ddcdaf');gr.addColorStop(.06,'#f3e9d4');gr.addColorStop(1,'#f6eddb')}else{gr.addColorStop(0,'#f6eddb');gr.addColorStop(.94,'#f3e9d4');gr.addColorStop(1,'#ddcdaf')}g.fillStyle=gr;g.fillRect(x0,0,W/2,H)}
  g.strokeStyle='rgba(110,130,165,.3)';g.lineWidth=Math.max(1,H/450);for(let k=2;k<9;k++){const y=H*k/9;g.beginPath();g.moveTo(W*.035,y);g.lineTo(W*.47,y);g.moveTo(W*.53,y);g.lineTo(W*.965,y);g.stroke()}}
 const TXT=H=>({font:'400 '+Math.round(H*.031)+'px '+SERIF,lh:H*.047});
 function header(g,W,H,ms,light){const m=cosmosMoon(dayKey(ms));g.textAlign='left';g.textBaseline='alphabetic';g.fillStyle=light?'rgba(255,238,205,.92)':'#3a2a1e';g.font='700 '+Math.round(H*.044)+'px '+SERIF;g.fillText(new Date(ms).toLocaleDateString('de-DE',{weekday:'long',day:'numeric',month:'long'}),W*.05,H*.095);
  g.fillStyle=light?'rgba(255,224,180,.7)':'#7a6450';g.font='400 '+Math.round(H*.03)+'px '+SERIF;g.fillText(hhmm(ms)+' Uhr · '+m.name,W*.05,H*.155)}
 function bookSpreads(){
  bk.stamp=raumPages().map(x=>x.id+'@'+x.updatedAt).join('|');
  const H=760,W=1140,{font,lh}=TXT(H),n1=Math.floor((H*.93-H*.27)/lh)+1,n2=Math.floor((H*.93-H*.09)/lh)+1,out=[];mctx.font=font;
  for(const x of raumPages()){
   const custom=x.title&&!/^Notizbuch ·/.test(x.title)?x.title:'',lines=wrap(mctx,(custom?custom+'\n':'')+String(x.body||'').trim(),W*.415);while(lines.length&&!lines.at(-1))lines.pop();
   const img=(x.photos||[])[0]||'',parts=[];let i=0,first=true;
   do{const left=lines.slice(i,i+(first?n1:n2));i+=left.length;const right=img&&first?[]:lines.slice(i,i+n2);i+=right.length;parts.push({item:x,img:first?img:'',head:first,left,right});first=false}while(i<lines.length);
   out.push(...parts)}
  return out}
 function photo(id){if(imgCache.has(id))return imgCache.get(id);const rec={img:null};imgCache.set(id,rec);PulsePhotos.url(id).then(u=>{if(!u)return;const im=new Image();im.onload=()=>{rec.img=im;if(bk.view==='read')drawSpread()};im.src=u}).catch(()=>{});return rec}
 function drawSpread(){
  const c=spreadTex.userData.canvas,g=c.getContext('2d'),W=c.width,H=c.height,s=bk.spreads[bk.index],{font,lh}=TXT(H);g.clearRect(0,0,W,H);g.textAlign='left';g.textBaseline='alphabetic';
  if(!s){paper(g,W,H);g.fillStyle='#3a2a1e';g.font='700 '+Math.round(H*.05)+'px '+SERIF;g.fillText('Dein Notizbuch',W*.05,H*.14);g.fillStyle='#5a4636';g.font=font;let y=H*.27;for(const l of wrap(g,'Noch leer. Tippe auf „Schreiben“. In der Brille hältst du den Trigger gedrückt (oder Daumen und Zeigefinger zusammen) und schreibst in die Luft. Am Handy schreibst du mit dem Finger oder tippst.',W*.415)){g.fillText(l,W*.05,y);y+=lh}}
  else{const im=s.img?photo(s.img).img:null;if(im)g.drawImage(im,0,0,W,H);else paper(g,W,H);if(s.head)header(g,W,H,Date.parse(s.item.createdAt)||Date.now());
   g.fillStyle='#2b2118';g.font=font;let y=s.head?H*.27:H*.09;for(const l of s.left){g.fillText(l,W*.05,y);y+=lh}y=H*.09;for(const l of s.right){g.fillText(l,W*.535,y);y+=lh}
   g.fillStyle='#8a7560';g.font='400 '+Math.round(H*.026)+'px '+SERIF;g.textAlign='center';g.fillText((bk.index+1)+' / '+bk.spreads.length,W*.75,H*.972)}
  spreadTex.needsUpdate=true;turnPrev.visible=bk.index>0;turnNext.visible=bk.index<bk.spreads.length-1}
 function bookPose(){return frontPose(presenting()?.62:fitDist(SPW+.24,SPH+.2),presenting()?.2:.07,-.18)}
 function openBook(index){
  if(bk.view==='write'||bk.saving)return;
  bk.spreads=bookSpreads();bk.index=index??Math.max(0,bk.spreads.length-1);drawSpread();
  if(bk.view!=='read'){const to=bookPose();tween(book,{position:closedBook.position.clone(),quaternion:closedBook.quaternion.clone(),scale:.3},{position:to.position,quaternion:new THREE.Quaternion().setFromEuler(to.rotation),scale:1},.55);book.visible=true;closedBook.visible=false;bk.view='read';focusView(to.position,70)}
 }
 function closeBook(){book.visible=false;closedBook.visible=true;bk.view='closed'}
 function bookTurn(d){if(!bk.spreads.length)return;bk.index=clamp(bk.index+d,0,bk.spreads.length-1);drawSpread()}
 /* Writing: a surface of light at arm's length. Trigger held (or thumb and index finger together) = ink. */
 const PW=.7,PH=PW/1.5,pane=new THREE.Group();pane.visible=false;scene.add(pane);
 const paneTex=canvasTex(1050,700),paneMesh=new THREE.Mesh(new THREE.PlaneGeometry(PW,PH),new THREE.MeshBasicMaterial({map:paneTex,transparent:true,depthWrite:false,fog:false}));paneMesh.renderOrder=4;pane.add(paneMesh);hits.push(paneMesh);
 const INK_MAX=60000,inkPos=new Float32Array(INK_MAX*3),inkGeo=new THREE.BufferGeometry(),inkAttr=new THREE.BufferAttribute(inkPos,3);inkAttr.setUsage(THREE.DynamicDrawUsage);inkGeo.setAttribute('position',inkAttr);inkGeo.setDrawRange(0,0);
 const ink=new THREE.Points(inkGeo,new THREE.PointsMaterial({map:GLOW_INK,size:.011,color:0xffd58a,transparent:true,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));ink.frustumCulled=false;ink.renderOrder=6;pane.add(ink);
 let inkN=0,inkDirty=-1;
 const draft={text:'',strokes:[]};
 if(prefs.draft&&typeof prefs.draft==='object'){draft.text=String(prefs.draft.text||'').slice(0,20000);draft.strokes=(Array.isArray(prefs.draft.strokes)?prefs.draft.strokes:[]).filter(Array.isArray).map(s=>s.map(v=>Number(v)/1000).filter(Number.isFinite)).filter(s=>s.length>=3).map(s=>s.slice(0,s.length-s.length%3))}
 const SPEECH=pulseSpeechSupported();
 const writeBtns=row(pane,[['Fertig',()=>finishWrite(),.12],['↶',()=>undoStroke(),.07],['Tippen',()=>toggleTyping(),.12],...(SPEECH?[['Diktieren',()=>dictate(),.13]]:[]),['Später',()=>leaveWrite(),.11],['Verwerfen',()=>discardWrite(),.13]],-PH/2-.065,{h:.05,gap:.01});
 /* The buttons stand 10 cm in front of the writing plane, so a stroke that runs past the edge never presses one. */
 writeBtns.forEach(b=>{b.position.z=.1;b.rotation.x=-.35});
 const dictBtn=SPEECH?writeBtns[3]:null,discardBtn=writeBtns.at(-1);
 function inkAdd(x,y,z){if(inkN>=INK_MAX)return;inkPos[inkN*3]=x;inkPos[inkN*3+1]=y;inkPos[inkN*3+2]=z;inkN++}
 function inkSeg(ax,ay,az,bx,by,bz){const d=Math.hypot(bx-ax,by-ay,bz-az),n=Math.min(60,Math.floor(d/.0025));for(let k=1;k<n;k++){const t=k/n;inkAdd(ax+(bx-ax)*t,ay+(by-ay)*t,az+(bz-az)*t)}inkAdd(bx,by,bz)}
 /* New ink is uploaded once per frame: only the part written since the last frame (or everything after an undo). */
 function inkMark(from){if(inkDirty!==-2)inkDirty=inkDirty<0?from:Math.min(inkDirty,from)}
 function inkUpload(){if(inkDirty===-1)return;inkGeo.setDrawRange(0,inkN);inkAttr.clearUpdateRanges();if(inkDirty>=0&&inkN>inkDirty)inkAttr.addUpdateRange(inkDirty*3,(inkN-inkDirty)*3);inkAttr.needsUpdate=true;inkDirty=-1}
 function inkRebuild(){inkN=0;for(const s of draft.strokes){if(s.length<3)continue;inkAdd(s[0],s[1],s[2]);for(let i=3;i<s.length;i+=3)inkSeg(s[i-3],s[i-2],s[i-1],s[i],s[i+1],s[i+2])}inkDirty=-2}
 function strokeAdd(s,x,y,z){const n=s.length,from=inkN;if(n){const d=Math.hypot(x-s[n-3],y-s[n-2],z-s[n-1]);if(d<.002)return;inkSeg(s[n-3],s[n-2],s[n-1],x,y,z)}else inkAdd(x,y,z);s.push(x,y,z);inkMark(from)}
 let caret=true,caretT=0,draftTimer=0;
 function drawPane(){
  const c=paneTex.userData.canvas,g=c.getContext('2d'),W=c.width,H=c.height,{font,lh}=TXT(H);g.clearRect(0,0,W,H);g.textAlign='left';g.textBaseline='alphabetic';
  g.fillStyle='rgba(18,12,9,.44)';rr(g,0,0,W,H,36);g.fill();g.strokeStyle='rgba(255,214,150,.6)';g.lineWidth=4;rr(g,6,6,W-12,H-12,30);g.stroke();
  g.strokeStyle='rgba(255,224,170,.17)';g.lineWidth=2;for(let k=2;k<9;k++){const y=H*k/9;g.beginPath();g.moveTo(W*.035,y);g.lineTo(W*.47,y);g.moveTo(W*.53,y);g.lineTo(W*.965,y);g.stroke()}
  g.setLineDash([10,14]);g.beginPath();g.moveTo(W/2,H*.05);g.lineTo(W/2,H*.95);g.stroke();g.setLineDash([]);
  header(g,W,H,Date.now(),true);
  g.fillStyle='rgba(255,242,220,.96)';g.font=font;let y=H*.27,side=0;const lines=wrap(g,draft.text,W*.415);
  lines.forEach((l,i)=>{if(y>H*.93&&!side){side=1;y=H*.09}if(y>H*.93)return;const x=side?W*.535:W*.05;g.fillText(l,x,y);if(i===lines.length-1&&kb.visible&&caret)g.fillRect(x+g.measureText(l).width+3,y-lh*.62,3,lh*.72);y+=lh});
  g.fillStyle='rgba(255,236,200,.62)';g.font='400 '+Math.round(H*.03)+'px '+FONT;g.textAlign='center';g.fillText(presenting()?'Trigger halten oder Daumen und Zeigefinger zusammen – und in die Luft schreiben':'Mit dem Finger auf die Fläche schreiben',W/2,H*.975);
  paneTex.needsUpdate=true}
 function persistSoon(){clearTimeout(draftTimer);draftTimer=setTimeout(persistDraft,2500)}
 function persistDraft(){clearTimeout(draftTimer);const has=draft.text.trim()||draft.strokes.length;if(has)prefs.draft={text:draft.text,strokes:draft.strokes.filter(s=>s.length>=3).map(s=>s.map(v=>Math.round(v*1000)))};else delete prefs.draft;save()}
 function startWrite(){
  if(bk.saving)return;closedBook.visible=false;book.visible=false;bk.view='write';bk.confirm=0;discardBtn.userData.setLabel('Verwerfen');
  const pose=frontPose(presenting()?.5:fitDist(PW+.08,PH+.22),presenting()?.17:.06,-.12);place(pane,pose);pane.visible=true;focusView(pose.position.clone().add(V(0,-.06,0)),70);kbShow(false);inkRebuild();
  if(presenting())say('Schreib in die Luft. Die Schrift landet nachher im Notizbuch.',4200)}
 function leaveWrite(){if(pulseDictation)pulseStopDictation();persistDraft();pane.visible=false;kbShow(false);bk.view='closed';closedBook.visible=true;raumControls()}
 function discardWrite(){if(!draft.text.trim()&&!draft.strokes.length)return leaveWrite();if(performance.now()-bk.confirm>3000){bk.confirm=performance.now();discardBtn.userData.setLabel('Wirklich?');setTimeout(()=>{if(performance.now()-bk.confirm>=2900)discardBtn.userData.setLabel('Verwerfen')},3000);return}draft.text='';draft.strokes=[];inkRebuild();leaveWrite();say('Seite verworfen.')}
 function undoStroke(){if(!draft.strokes.length)return say('Kein Strich zum Zurücknehmen.');draft.strokes.pop();inkRebuild();persistSoon()}
 function setText(t){draft.text=String(t||'').slice(0,20000);drawPane();persistSoon()}
 /* Projection onto the page: the light surface is the spread. Writing that went past its edges is scaled
    down until everything fits, so nothing written in the air gets lost. */
 function projector(){let x0=0,y0=0,x1=1,y1=1;const uv=(x,y)=>[x/PW+.5,.5-y/PH];for(const s of draft.strokes)for(let i=0;i<s.length;i+=3){const [u,v]=uv(s[i],s[i+1]);x0=Math.min(x0,u);x1=Math.max(x1,u);y0=Math.min(y0,v);y1=Math.max(y1,v)}
  const k=1/Math.max(x1-x0,y1-y0),ox=(1-(x1-x0)*k)/2,oy=(1-(y1-y0)*k)/2;return (x,y)=>{const [u,v]=uv(x,y);return [(u-x0)*k+ox,(v-y0)*k+oy]}}
 function inkImage(){const W=1500,H=1000,c=document.createElement('canvas');c.width=W;c.height=H;const g=c.getContext('2d');paper(g,W,H);const map=projector();
  g.strokeStyle='#22304f';g.lineCap='round';g.lineJoin='round';g.lineWidth=W*.0042;
  for(const s of draft.strokes){if(s.length<3)continue;const p=[];for(let i=0;i<s.length;i+=3){const [u,v]=map(s[i],s[i+1]);p.push([u*W,v*H])}g.beginPath();g.moveTo(p[0][0],p[0][1]);if(p.length===1)g.lineTo(p[0][0]+.5,p[0][1]+.5);for(let k=1;k<p.length-1;k++)g.quadraticCurveTo(p[k][0],p[k][1],(p[k][0]+p[k+1][0])/2,(p[k][1]+p[k+1][1])/2);if(p.length>1)g.lineTo(p.at(-1)[0],p.at(-1)[1]);g.stroke()}
  return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('Das Bild der Seite ließ sich nicht erzeugen.')),'image/png'))}
 async function finishWrite(){
  if(bk.saving)return;const text=draft.text.trim();if(!text&&!draft.strokes.length)return say('Die Seite ist noch leer.');
  if(pulseDictation)pulseStopDictation();bk.saving=true;let photoId='';
  try{if(draft.strokes.length){if(!PulsePhotos.supported)throw Error('Dieser Browser kann keine Bilder speichern.');photoId=await PulsePhotos.add(await inkImage())}}
  catch(e){bk.saving=false;return say('Nicht gespeichert: '+e.message,5000)}
  const now=Date.now(),ok=lifeMutate(()=>PulseLife.create(db,{kind:'note',room:'innen',source:'raum',title:raumTitle(now),body:text,photos:photoId?[photoId]:[]},uid('life'),new Date(now).toISOString()),'Ins Notizbuch geschrieben');
  bk.saving=false;if(!ok)return;
  draft.text='';draft.strokes=[];persistDraft();kbShow(false);
  const to=bookPose();tween(pane,null,{position:to.position,quaternion:new THREE.Quaternion().setFromEuler(to.rotation),scale:SPW/PW},.9,()=>{pane.visible=false;pane.scale.setScalar(1);inkRebuild();bk.view='closed';openBook();for(let i=tweens.length-1;i>=0;i--)if(tweens[i].obj===book)tweens.splice(i,1);place(book,to)})}
 /* Typing: a keyboard of light in VR, a text field on the phone; a Bluetooth keyboard works too. */
 const KB_ROWS=[[['1'],['2'],['3'],['4'],['5'],['6'],['7'],['8'],['9'],['0'],['ß'],['⌫',1,'back']],[['q'],['w'],['e'],['r'],['t'],['z'],['u'],['i'],['o'],['p'],['ü'],['?']],[['a'],['s'],['d'],['f'],['g'],['h'],['j'],['k'],['l'],['ö'],['ä'],['!']],[['⇧',1.5,'shift'],['y'],['x'],['c'],['v'],['b'],['n'],['m'],[','],['.'],['-',1.5]],[['Leertaste',7,'space'],['↵',2,'enter'],['Fertig',3,'close']]];
 const kbKeys=[];KB_ROWS.forEach((r,ri)=>{let x=0;for(const [label,w=1,code] of r){kbKeys.push({label,w,code:code||label,row:ri,x0:x,x1:x+w});x+=w}});
 const kbTex=canvasTex(1240,500),kb=new THREE.Mesh(new THREE.PlaneGeometry(.62,.25),new THREE.MeshBasicMaterial({map:kbTex,transparent:true,depthWrite:false,fog:false}));kb.renderOrder=5;kb.position.set(0,-PH/2-.26,.12);kb.rotation.x=-.6;kb.visible=false;pane.add(kb);hits.push(kb);
 const kbs={shift:false,hover:null,flash:null,flashT:0};
 const kbCaps=()=>kbs.shift||!draft.text||/[.!?]\s+$|\n\s*$/.test(draft.text);
 function kbDraw(){const c=kbTex.userData.canvas,g=c.getContext('2d'),W=c.width,H=c.height,u=W/12,rh=H/5,caps=kbCaps();g.clearRect(0,0,W,H);g.fillStyle='rgba(30,19,12,.93)';rr(g,0,0,W,H,28);g.fill();g.textAlign='center';g.textBaseline='middle';
  for(const k of kbKeys){const x=k.x0*u+5,y=k.row*rh+5,w=k.w*u-10,h=rh-10,fl=kbs.flash===k;g.fillStyle=fl?'#e9b872':kbs.hover===k?'#6e4a30':'#3e2a1c';rr(g,x,y,w,h,14);g.fill();if(k.code==='shift'&&kbs.shift){g.strokeStyle='#e9b872';g.lineWidth=4;rr(g,x,y,w,h,14);g.stroke()}
   const label=k.label.length===1&&caps&&k.label!=='ß'?k.label.toLocaleUpperCase('de'):k.label;let fs=Math.round(rh*(label.length>1?.36:.46));g.font='600 '+fs+'px '+FONT;while(fs>10&&g.measureText(label).width>w*.86){fs--;g.font='600 '+fs+'px '+FONT}g.fillStyle=fl?'#2c1a10':'#fbe8c6';g.fillText(label,x+w/2,y+h/2+2)}
  kbTex.needsUpdate=true}
 const kbKeyAt=uv=>{if(!uv)return null;const x=uv.x*12,r=Math.floor((1-uv.y)*5);return kbKeys.find(k=>k.row===r&&x>=k.x0&&x<k.x1)||null};
 function kbType(ch){if(ch==='back')draft.text=Array.from(draft.text).slice(0,-1).join('');else if(ch==='enter')draft.text+='\n';else if(ch==='space')draft.text+=' ';else draft.text+=ch;draft.text=draft.text.slice(0,20000);caret=true;caretT=performance.now();drawPane();if(kb.visible)kbDraw();persistSoon()}
 function kbPress(k){if(!k)return;kbs.flash=k;kbs.flashT=performance.now();
  if(k.code==='shift'){kbs.shift=!kbs.shift;kbDraw();return}if(k.code==='close'){kbShow(false);return}
  if(['back','enter','space'].includes(k.code))kbType(k.code);else{const ch=kbCaps()&&k.label!=='ß'?k.label.toLocaleUpperCase('de'):k.label;kbs.shift=false;kbType(ch)}}
 kb.userData.onSelect=h=>kbPress(kbKeyAt(h&&h.uv));
 function kbShow(on){kb.visible=on;writeBtns[2].userData.setActive(on);if(on)kbDraw();drawPane()}
 function toggleTyping(){if(presenting())kbShow(!kb.visible);else raumTypeOpen(draft.text)}
 function dictate(){const f=document.getElementById('raumDictate');if(!f)return;if(!f.dataset.wired){f.dataset.wired='1';f.addEventListener('input',()=>{draft.text=f.value.slice(0,20000);drawPane();persistSoon()})}if(!pulseDictation)f.value=draft.text;pulseDictate('raumDictate')}
 function onKey(e){if(bk.view!=='write'||e.ctrlKey||e.metaKey||e.altKey)return;const t=e.target;if(t&&(t.tagName==='INPUT'||t.tagName==='TEXTAREA'||t.isContentEditable))return;if(!presenting()&&document.getElementById('appMain')?.dataset.view!=='raum')return;
  if(e.key==='Backspace')kbType('back');else if(e.key==='Enter')kbType('enter');else if(e.key.length===1)kbType(e.key===' '?'space':e.key);else return;e.preventDefault()}
 window.addEventListener('keydown',onKey);
 /* ---------- Fireflies at night ---------- */
 const flyPos=new Float32Array(70*3),flyBase=[];for(let i=0;i<70;i++){const p=at(R(0,360),R(4,16));flyBase.push([p.x,R(.3,2.4),p.z,rnd()*99])}
 const flyGeo=new THREE.BufferGeometry();flyGeo.setAttribute('position',new THREE.BufferAttribute(flyPos,3));
 const flies=new THREE.Points(flyGeo,new THREE.PointsMaterial({map:GLOW_FIRE,size:.16,color:0xe6ff9a,transparent:true,opacity:0,blending:THREE.AdditiveBlending,depthWrite:false,fog:false}));flies.frustumCulled=false;scene.add(flies);
 /* ---------- Time of day ---------- */
 const KEYS=[[-90,0x02040b,0x070d1d,0x000000,0x24304e,0x0d0f15,.9,0,1],[-16,0x03081a,0x0b1530,0x0a0a18,0x26324f,0x0e1016,.9,0,1],[-10,0x0a1433,0x23305a,0x3a2c55,0x343e62,0x15161d,1,0,.85],[-5,0x1b2b5c,0x7d6080,0xc0607a,0x5a5876,0x24222a,1.3,0,.35],[-1.5,0x2a4380,0xdd8a64,0xff7a45,0x8a7c94,0x33302c,1.7,.2,.06],[1,0x3a5a98,0xf0a06a,0xff9050,0xa89a9c,0x40382c,2.1,1.2,0],[5,0x4775bb,0xf0c896,0xffb468,0xbcc6d4,0x4a4232,2.5,2.2,0],[12,0x4277c8,0xd8e2ea,0xffe0b0,0xcdd9e8,0x544e3e,2.8,2.8,0],[30,0x3a73cc,0xc6dbf0,0xfff0d8,0xd6e3f4,0x5a5440,3,3.2,0],[90,0x2f6bd0,0xbfd7f2,0xfff6e6,0xdbe8fa,0x5a5440,3.1,3.4,0]];
 const cA=new THREE.Color(),cB=new THREE.Color(),pal={zenith:C(0),horizon:C(0),glow:C(0),hemiSky:C(0),hemiGround:C(0),hemi:1,sun:1,stars:0};
 function palette(alt){let i=0;while(i<KEYS.length-2&&alt>KEYS[i+1][0])i++;const a=KEYS[i],b=KEYS[i+1],t=clamp((alt-a[0])/(b[0]-a[0]),0,1);['zenith','horizon','glow','hemiSky','hemiGround'].forEach((k,n)=>pal[k].copy(cA.setHex(a[n+1])).lerp(cB.setHex(b[n+1]),t));pal.hemi=lerp(a[6],b[6],t);pal.sun=lerp(a[7],b[7],t);pal.stars=lerp(a[8],b[8],t);return pal}
 function target(mode){const now=Date.now();if(mode==='echt')return now;const t=PulseAstro.sunTimes(key());if(!t)return now;return mode==='morgen'?t.rise+35*60000:mode==='tag'?t.noon:mode==='abend'?t.set-25*60000:t.set+3.5*3600000}
 let shown=target(prefs.time),aim=shown,nightF=0,lastSky=-1e9,infoText='';
 const sunV=V(0,1,0),moonV=V(0,-1,0),cWhite=C(0xffffff),cWarm=C(0xffa060),cWarmBulb=C(0xffe4b0);
 function applySky(ms){
  const s=PulseSunPos.sun(ms,LAT,LON),m=PulseSunPos.moon(ms,LAT,LON);sunV.set(...PulseSunPos.vector(s.alt,s.az));moonV.set(...PulseSunPos.vector(m.alt,m.az));
  const p=palette(s.alt),illum=(1-sunV.dot(moonV))/2;nightF=p.stars;
  skyU.sunDir.value.copy(sunV);skyU.moonDir.value.copy(moonV);skyU.zenith.value.copy(p.zenith);skyU.horizon.value.copy(p.horizon);skyU.glow.value.copy(p.glow);skyU.sunVis.value=smooth(-6,2,s.alt);skyU.moonGlow.value=nightF*illum*(m.alt>-2?1:0);
  seaU.sunDir.value.copy(sunV);seaU.moonDir.value.copy(moonV);seaU.zenith.value.copy(p.zenith);seaU.horizon.value.copy(p.horizon);seaU.sunCol.value.copy(p.glow).lerp(cWhite,.4);seaU.sunVis.value=smooth(-2,2,s.alt);seaU.moonVis.value=nightF*illum*smooth(-1,3,m.alt);
  scene.fog.color.copy(p.horizon).multiplyScalar(.92);seaU.fogColor.value.copy(scene.fog.color);starU.vis.value=p.stars;
  stars.quaternion.setFromAxisAngle(Pv,-(s.lst||0)*RAD);
  moon.position.copy(moonV).multiplyScalar(2150);moonHalo.position.copy(moonV).multiplyScalar(2140);moonU.sunDir.value.copy(sunV);moonU.day.value=smooth(-6,4,s.alt);moon.visible=moonHalo.visible=m.alt>-3;moonHalo.material.opacity=.7*nightF*illum;
  hemi.color.copy(p.hemiSky);hemi.groundColor.copy(p.hemiGround);hemi.intensity=p.hemi;
  sunLight.position.copy(sunV).multiplyScalar(100);sunLight.intensity=s.alt>-2?p.sun:0;sunLight.color.copy(cWhite).lerp(cWarm,1-smooth(2,22,s.alt));
  moonLight.position.copy(moonV).multiplyScalar(100);moonLight.intensity=m.alt>0?.5*illum*nightF:0;
  for(const c of clouds.children){c.material.color.copy(p.horizon).lerp(cWhite,.35*(1-nightF)).lerp(p.glow,.25*(1-smooth(4,18,s.alt))*(1-nightF));c.material.opacity=.85-.55*nightF}
  flies.material.opacity=nightF*.95;const dusk=smooth(8,-4,s.alt);poolMat.opacity=.3*dusk;garland.glow.material.opacity=Math.min(1,dusk*1.05);garland.bulbs.material.color.setHex(0x6b5a3a).lerp(cWarmBulb,dusk);
  lights.lantern.userData.base=1.4+5*nightF;lights.tarot.userData.base=lights.altar.userData.base=.8+2.4*nightF;
  const mm=cosmosMoon(dayKey(ms)),text=hhmm(ms)+' · '+(s.alt>6?'Tag':s.alt>-6?(new Date(ms).getHours()<12?'Morgendämmerung':'Abenddämmerung'):'Nacht')+' · '+mm.name+' '+mm.illumination+' %';
  if(text!==infoText){infoText=text;pultInfo.userData.draw((g,W,H)=>{g.fillStyle='rgba(38,24,16,.88)';rr(g,0,0,W,H,26);g.fill();g.fillStyle='#fbe8c6';let fs=Math.round(H*.48);g.font='700 '+fs+'px '+FONT;while(fs>12&&g.measureText(text).width>W*.94){fs--;g.font='700 '+fs+'px '+FONT}g.textAlign='center';g.textBaseline='middle';g.fillText(text,W/2,H/2+2)})}
 }
 function setTime(mode){prefs.time=mode;let t=target(mode);if(mode!=='echt'&&t<shown-3600000)t+=86400000;aim=t;if(reducedMotion()){shown=aim;applySky(shown)}timeBtns.forEach(b=>b.userData.setActive(b.userData.key===mode))}
 let soundOn=false;
 function markSound(){const cur=PulseSoundscape.playing();soundBtns.forEach(b=>b.userData.setActive(b.userData.key===cur))}
 function setSound(kind,temp){if(!temp)prefs.sound=kind;PulseSoundscape.play(kind);soundOn=!!kind;markSound()}
 function setBreath(on){prefs.breath=on;breathBtn.userData.setActive(on)}
 /* "Weniger": nothing sways, flickers or drifts, no fireflies, the sea slows down, stations you are not at are dimmed. */
 let wristCalm=null;
 function setCalm(on){prefs.calm=!!on;calmBtn.userData.setActive(prefs.calm);wristCalm?.userData.setActive(prefs.calm);for(const m of windMats)m.userData.amp.value=prefs.calm?0:m.userData.full;flies.visible=!prefs.calm}
 function toggleCalm(){setCalm(!prefs.calm);save();say(prefs.calm?'Weniger: keine Bewegung, kein Flackern, die anderen Stationen gedimmt.':'Alles wieder an.')}
 setTime(prefs.time);shown=aim;setBreath(prefs.breath);setCalm(prefs.calm);markSound();applySky(shown);sgLoad(true);
 /* ---------- Input: finger or mouse on the phone, rays and pens in VR ---------- */
 const ray=new THREE.Raycaster(),ndc=new THREE.Vector2();
 function visible(o){while(o){if(!o.visible)return false;o=o.parent}return true}
 function pickAt(origin,dir){ray.set(origin,dir);return ray.intersectObjects(hits.filter(visible),false)[0]||null}
 function castAt(e){const r=canvas.getBoundingClientRect();ndc.set((e.clientX-r.left)/r.width*2-1,-(e.clientY-r.top)/r.height*2+1);ray.setFromCamera(ndc,camera);return pickAt(ray.ray.origin.clone(),ray.ray.direction.clone())}
 const touches=new Map();let ptr=null,pinch=null,viewAnim=null;
 /* Phone: turn and zoom the view smoothly towards something (a corner, the book). */
 function focusView(target,fov){if(presenting())return;const p=target.isVector3?tV.copy(target):(target.updateWorldMatrix(true,false),target.getWorldPosition(tV));camera.getWorldPosition(tV2);p.sub(tV2);
  const ty=Math.atan2(-p.x,-p.z),tp=Math.atan2(p.y,Math.hypot(p.x,p.z)),dy=Math.atan2(Math.sin(ty-yaw),Math.cos(ty-yaw));viewAnim={y0:yaw,y1:yaw+dy,p0:pitch,p1:tp,f0:camera.fov,f1:fov??Math.min(camera.fov,camera.aspect<1?52:60),t:0}}
 /* The zoom that shows something `w` metres wide at `target` on the phone. */
 function fovFor(target,w){target.updateWorldMatrix(true,false);const d=target.getWorldPosition(tV3).distanceTo(camera.getWorldPosition(tV2)),hf=2*Math.atan(w/2/Math.max(.3,d))*1.12;return clamp(2*Math.atan(Math.tan(hf/2)/camera.aspect)/RAD,35,75)}
 function runView(dt){if(!viewAnim)return;const v=viewAnim;v.t=Math.min(1,v.t+dt/(reducedMotion()?.01:.7));const e=v.t<.5?2*v.t*v.t:1-Math.pow(-2*v.t+2,2)/2;yaw=lerp(v.y0,v.y1,e);pitch=lerp(v.p0,v.p1,e);camera.fov=lerp(v.f0,v.f1,e);camera.updateProjectionMatrix();look();if(v.t>=1)viewAnim=null}
 canvas.addEventListener('pointerdown',e=>{if(presenting())return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});try{canvas.setPointerCapture(e.pointerId)}catch(_){}
  if(touches.size>=2){const [a,b]=[...touches.values()];pinch={d:Math.hypot(a.x-b.x,a.y-b.y)||1,f:camera.fov};if(ptr?.mode==='draw')persistSoon();ptr=null;return}
  viewAnim=null;const h=castAt(e);if(bk.view==='write'&&h&&h.object===paneMesh){ptr={mode:'draw',stroke:null};drawAt(h)}else ptr={mode:'look',x:e.clientX,y:e.clientY,yaw,pitch,t:performance.now()}});
 canvas.addEventListener('pointermove',e=>{if(presenting()||!touches.has(e.pointerId))return;touches.set(e.pointerId,{x:e.clientX,y:e.clientY});
  if(pinch){if(touches.size>=2){const [a,b]=[...touches.values()];camera.fov=clamp(pinch.f*pinch.d/(Math.hypot(a.x-b.x,a.y-b.y)||1),30,85);camera.updateProjectionMatrix()}return}
  if(!ptr)return;if(ptr.mode==='draw'){const h=castAt(e);if(h&&h.object===paneMesh)drawAt(h);else ptr.stroke=null}else{const k=camera.fov/70;yaw=ptr.yaw+(e.clientX-ptr.x)*.005*k;pitch=clamp(ptr.pitch+(e.clientY-ptr.y)*.004*k,-1.2,1.2);look()}});
 const pointerEnd=e=>{touches.delete(e.pointerId);if(pinch){if(touches.size<2)pinch=null;ptr=null;return}const p=ptr;ptr=null;if(!p||presenting())return;
  if(p.mode==='draw'){persistSoon();return}if(e.type==='pointerup'&&Math.hypot(e.clientX-p.x,e.clientY-p.y)<8&&performance.now()-p.t<600){const h=castAt(e);if(h&&h.object.userData.onSelect){pulseTap(6);h.object.userData.onSelect(h)}}};
 canvas.addEventListener('pointerup',pointerEnd);canvas.addEventListener('pointercancel',pointerEnd);
 canvas.addEventListener('wheel',e=>{e.preventDefault();viewAnim=null;camera.fov=clamp(camera.fov+e.deltaY*.03,30,85);camera.updateProjectionMatrix()},{passive:false});
 function drawAt(h){pane.worldToLocal(tV.copy(h.point));if(!ptr.stroke){ptr.stroke=[];draft.strokes.push(ptr.stroke)}strokeAdd(ptr.stroke,tV.x,tV.y,.002)}
 /* VR: two controllers or hands. Each has a ray for buttons and a pen tip for writing. */
 const penMat=new THREE.MeshLambertMaterial({color:0x3a2618}),handMat=new THREE.MeshLambertMaterial({color:0xf2d6b8,transparent:true,opacity:.75});
 const pens=[0,1].map(i=>{
  const c=renderer.xr.getController(i),grip=renderer.xr.getControllerGrip(i),hand=renderer.xr.getHand(i);rig.add(c,grip,hand);
  const line=new THREE.Line(new THREE.BufferGeometry().setFromPoints([V(0,0,0),V(0,0,-1)]),new THREE.LineBasicMaterial({color:0xffe2b0,transparent:true,opacity:.5}));line.scale.z=3;line.visible=false;c.add(line);
  const nib=new THREE.Mesh(new THREE.ConeGeometry(.006,.04,10).rotateX(-Math.PI/2).translate(0,0,-.02),penMat);nib.visible=false;c.add(nib);
  const body=new THREE.Mesh(new THREE.CylinderGeometry(.016,.02,.11,12).rotateX(Math.PI/2),penMat);body.visible=false;grip.add(body);
  const joints=new THREE.InstancedMesh(new THREE.SphereGeometry(.008,8,6),handMat,25);joints.count=0;joints.frustumCulled=false;scene.add(joints);
  const dot=new THREE.Mesh(new THREE.SphereGeometry(.008,10,8),new THREE.MeshBasicMaterial({color:0xfff1d6}));dot.visible=false;scene.add(dot);
  const tip=sprite(GLOW_INK,.03,0xffd58a,.5);tip.visible=false;scene.add(tip);
  const p={c,grip,hand,line,nib,body,joints,dot,tip,src:null,hit:null,ui:null,down:false,stroke:null,penStart:false};
  c.addEventListener('connected',e=>{p.src=e.data;const isHand=!!(e.data&&e.data.hand);line.visible=!!e.data&&e.data.targetRayMode!=='gaze';nib.visible=body.visible=!isHand});
  c.addEventListener('disconnected',()=>{p.src=null;line.visible=nib.visible=body.visible=dot.visible=tip.visible=false;joints.count=0;p.down=false;p.stroke=null});
  /* A press that starts on a button is a click; a press that starts on the writing surface (or in the air) writes. */
  c.addEventListener('selectstart',()=>{const h=p.hit;p.ui=h&&h.object!==paneMesh&&h.object.userData.onSelect?h.object:null;p.penStart=bk.view==='write'&&!p.ui&&penInside(p);p.down=true;p.stroke=null});
  c.addEventListener('selectend',()=>{p.down=false;if(p.stroke)persistSoon();p.stroke=null});
  c.addEventListener('select',()=>{if(p.penStart){p.penStart=false;return}const h=p.hit;if(h&&h.object.userData.onSelect&&(!p.ui||h.object===p.ui)){h.object.userData.onSelect(h);if(p.src&&p.src.hand)roomClick();else try{p.src?.gamepad?.hapticActuators?.[0]?.pulse(.35,18)}catch(_){}}});
  return p});
 function penWorld(p,out){const h=p.src&&p.src.hand?p.hand.joints:null;if(h&&h['index-finger-tip']&&h['thumb-tip']){h['index-finger-tip'].getWorldPosition(out);h['thumb-tip'].getWorldPosition(tV3);return out.add(tV3).multiplyScalar(.5)}
  p.c.getWorldPosition(out);tV3.set(0,0,-1).applyQuaternion(p.c.getWorldQuaternion(tQ));return out.addScaledVector(tV3,.04)}
 const penLocal=(p,out)=>pane.worldToLocal(penWorld(p,out)),inPane=v=>v.z>-.3&&v.z<.6&&Math.abs(v.x)<PW*.8&&Math.abs(v.y)<PH*.9;
 function penInside(p){return inPane(penLocal(p,tV2))}
 let hovered=new Set(),uvHovered=new Map();const turnLatch=new WeakMap(),menuLatch=new WeakMap();
 function updateXR(nowMs){
  const now=new Set(),uvNow=new Map();let keyHover=null;const writing=bk.view==='write'&&pane.visible,plates=pokePlates();
  for(const p of pens){
   if(p.src&&p.src.hand){let n=0;for(const j of Object.values(p.hand.joints)){if(!j.visible)continue;tM.compose(j.getWorldPosition(tV),tQ.identity(),tV2.setScalar(1));p.joints.setMatrixAt(n++,tM)}p.joints.count=n;p.joints.instanceMatrix.needsUpdate=true}else p.joints.count=0;
   if(!p.line.visible){p.dot.visible=false;p.hit=null}
   else{tM.identity().extractRotation(p.c.matrixWorld);const o=V().setFromMatrixPosition(p.c.matrixWorld),d=V(0,0,-1).applyMatrix4(tM),h=pickAt(o,d);p.hit=h;
    if(h){p.dot.position.copy(h.point);p.dot.visible=true;p.line.scale.z=h.distance;const u=h.object.userData;if(u.paint)now.add(h.object);if(u.hoverUV)uvNow.set(h.object,h.uv);if(h.object===kb)keyHover=kbKeyAt(h.uv)}else{p.dot.visible=false;p.line.scale.z=3}}
   if(writing&&p.src){penWorld(p,tV);p.tip.position.copy(tV);p.tip.visible=true;pane.worldToLocal(tV);const inside=inPane(tV),drawing=p.down&&p.penStart&&inside;p.tip.material.opacity=drawing?1:inside?.6:.25;p.tip.scale.setScalar(drawing?.035:.025);
    if(drawing){if(!p.stroke){p.stroke=[];draft.strokes.push(p.stroke)}strokeAdd(p.stroke,tV.x,tV.y,tV.z)}else if(p.stroke&&!inside)p.stroke=null}
   else p.tip.visible=false;
   /* Pressing a surface with the fingertip or the tip of the controller, like a real button. Not while writing. */
   const f=p.src&&!p.down?pokeAt(p,plates):(p.poke=null);
   if(f&&f.d<.05){const u=f.o.userData;if(u.paint)now.add(f.o);if(u.hoverUV)uvNow.set(f.o,f.uv);if(f.o===kb)keyHover=kbKeyAt(f.uv)}}
  for(const o of hovered)if(!now.has(o))o.userData.setHover(false);for(const o of now)if(!hovered.has(o))o.userData.setHover(true);hovered=now;
  for(const [o] of uvHovered)if(!uvNow.has(o))o.userData.hoverUV(null);for(const [o,uv] of uvNow)o.userData.hoverUV(uv);uvHovered=uvNow;
  if(kb.visible&&keyHover!==kbs.hover){kbs.hover=keyHover;kbDraw()}
  /* Thumbstick left/right: a snap turn around the head. A or X: the menu at that hand. */
  const s=renderer.xr.getSession();if(s)for(const src of s.inputSources){const gp=src.gamepad;if(!gp)continue;
   const b=gp.buttons&&gp.buttons[4];if(b&&b.pressed){if(!menuLatch.get(src)){menuLatch.set(src,true);const p=pens.find(q=>q.src===src);if(p)wristToggle(p)}}else menuLatch.set(src,false);
   if(gp.axes.length<4)continue;const x=gp.axes[2];if(Math.abs(x)>.75&&!turnLatch.get(src)){turnLatch.set(src,true);const h=headWorld();rigTo(h.x,h.z,h.yaw-Math.sign(x)*Math.PI/6)}else if(Math.abs(x)<.3)turnLatch.set(src,false)}
  updateWrist(nowMs)}
 /* ---------- Small animations ---------- */
 const tweens=[];
 function tween(obj,from,to,dur,done){const f=from||{position:obj.position.clone(),quaternion:obj.quaternion.clone(),scale:obj.scale.x};for(let i=tweens.length-1;i>=0;i--)if(tweens[i].obj===obj)tweens.splice(i,1);obj.position.copy(f.position);obj.quaternion.copy(f.quaternion);obj.scale.setScalar(f.scale);tweens.push({obj,f,to,t:0,dur:reducedMotion()?.01:dur,done})}
 function runTweens(dt){for(let i=tweens.length-1;i>=0;i--){const w=tweens[i];if(!w)continue;w.t=Math.min(1,w.t+dt/w.dur);const e=w.t<.5?2*w.t*w.t:1-Math.pow(-2*w.t+2,2)/2;w.obj.position.lerpVectors(w.f.position,w.to.position,e);w.obj.quaternion.slerpQuaternions(w.f.quaternion,w.to.quaternion,e);w.obj.scale.setScalar(lerp(w.f.scale,w.to.scale,e));if(w.t>=1){tweens.splice(tweens.indexOf(w),1);w.done?.()}}}
 /* ---------- Hub: stations, moving between them, pressing surfaces, the menu at the hand ---------- */
 /* Stations rise or sink to the eye when you come to them (sitting or standing); it happens while the view is dark. */
 const stations={tarot:{label:'Tarot',anchor:tarotMark,stand:1,width:1.25,eye:1.3,lift:dy=>{tarot.group.position.y=1.3+dy}},sigil:{label:'Sigillen',anchor:sigMark,stand:1,width:1.45,eye:1.34,lift:dy=>{sig.group.position.y=1.34+dy}}};
 const built=[],homeBtns=[],hub={at:null,said:false};let building=null;
 /* The head in the tracked space (three keeps the camera there, also in VR) and in the room. */
 const hubF=V(),hubV=V();
 function headLocal(){hubF.set(0,0,-1).applyQuaternion(camera.quaternion);return {x:camera.position.x,y:camera.position.y,z:camera.position.z,yaw:PulseRaum.yawOf(hubF.x,hubF.z)}}
 const rigState=()=>({x:rig.position.x,z:rig.position.z,yaw:rig.rotation.y});
 function headWorld(){const l=headLocal(),r=rigState(),w=PulseRaum.turn(l.x,l.z,r.yaw);return {x:r.x+w.x,y:l.y,z:r.z+w.z,yaw:PulseRaum.wrapAngle(r.yaw+l.yaw)}}
 /* Moves the tracked space so the head stands at (x, z) and looks along yaw. The real height stays. */
 function rigTo(x,z,yaw){const r=PulseRaum.rigFor(rigState(),headWorld(),{x,z,yaw});rig.position.set(r.x,0,r.z);rig.rotation.y=r.yaw;rig.updateMatrixWorld(true)}
 /* A short fade to dark and back hides the jump; moving smoothly would make many people dizzy. */
 const fadeBall=new THREE.Mesh(new THREE.SphereGeometry(.35,16,10),new THREE.MeshBasicMaterial({color:0x000000,transparent:true,opacity:0,side:THREE.BackSide,depthTest:false,depthWrite:false,fog:false}));
 fadeBall.renderOrder=999;fadeBall.visible=false;fadeBall.frustumCulled=false;camera.add(fadeBall);
 let fade=null;
 function fadeTo(fn){if(!presenting())return fn();if(fade&&!fade.done){fade.fn=fn;return}fade={t:0,fn,done:false}}
 function runFade(dt){if(!fade)return;fade.t+=dt;const T1=reducedMotion()?.08:.16,T2=T1+(reducedMotion()?.12:.28);
  if(!fade.done&&fade.t>=T1){fade.done=true;try{fade.fn()}catch(e){console.error(e)}}
  const o=fade.t<T1?fade.t/T1:Math.max(0,1-(fade.t-T1)/(T2-T1));fadeBall.material.opacity=o;fadeBall.visible=o>.001;if(fade.t>=T2){fade=null;fadeBall.visible=false}}
 /* In VR: stand in front of the station, looking at it. On the phone: turn the view to it. */
 function goStation(id){
  const st=stations[id];if(!st||!st.anchor)return;wristHide();
  if(!presenting())return focusView(st.anchor,fovFor(st.anchor,st.width||1.3));
  fadeTo(()=>{if(st.lift)st.lift(clamp(headLocal().y-.1-(st.eye||1.4),-.4,.15));st.anchor.updateWorldMatrix(true,false);st.anchor.getWorldPosition(hubV);const p=PulseRaum.approach(hubV.x,hubV.z,st.stand||1);rigTo(p.x,p.z,p.yaw);hub.at=id;st.enter?.();
   if(!hub.said){hub.said=true;setTimeout(()=>{if(presenting())say('Zurück zur Mitte: „Zur Mitte“ hier oder im Menü an der Hand.',4500)},350)}});
 }
 function goHome(){wristHide();if(!presenting())return focusView(V(0,1.2,-2),70);fadeTo(()=>{rigTo(0,0,0);hub.at=null})}
 function homeButton(group,x,y,z=0,id=building){const b=button('Zur Mitte',.15,.05,goHome);b.position.set(x,y,z);b.visible=false;b.userData.station=id;group.add(b);homeBtns.push(b);return b}
 homeButton(tarot.group,.62,-.37,0,'tarot');homeButton(sig.group,0,-.33,0,'sigil');
 /* Pressing with the tip of the index finger (hands) or of the pen (controllers): a surface fires once when
    the tip goes through it from the front, and again only after the tip came back out. */
 const pk={tip:V(),local:V(),n:V(),inv:new THREE.Matrix4(),q:new THREE.Quaternion()};
 function pokePlates(){return hits.filter(o=>o!==paneMesh&&o.userData.onSelect&&o.geometry&&(o.geometry.type==='PlaneGeometry'||o.geometry.type==='CircleGeometry')&&visible(o))}
 function pokeTip(p,out){if(p.src&&p.src.hand){const j=p.hand.joints['index-finger-tip'];return j&&j.visible?j.getWorldPosition(out):null}
  p.c.getWorldPosition(out);pk.n.set(0,0,-1).applyQuaternion(p.c.getWorldQuaternion(pk.q));return out.addScaledVector(pk.n,.04)}
 function pokeAt(p,plates){
  const tip=pokeTip(p,pk.tip);if(!tip){p.poke=null;return null}
  let best=null,bd=1e9;
  for(const o of plates){if(o.userData.wrist&&p===wr.p)continue;
   pk.inv.copy(o.matrixWorld).invert();pk.local.copy(tip).applyMatrix4(pk.inv);
   const g=o.geometry.parameters,w=g.width??g.radius*2,h=g.height??g.radius*2;
   if(Math.abs(pk.local.x)>w/2+.004||Math.abs(pk.local.y)>h/2+.004)continue;
   const d=pk.local.z*pk.n.setFromMatrixColumn(o.matrixWorld,2).length();
   if(d<-.035||d>.05||Math.abs(d)>=bd)continue;
   bd=Math.abs(d);best={o,d,uv:{x:clamp(pk.local.x/w+.5,0,1),y:clamp(pk.local.y/h+.5,0,1)}}}
  if(!best){p.poke=null;return null}
  const prev=p.poke&&p.poke.o===best.o?p.poke:null;let pressed=prev?prev.pressed:false;
  if(pressed&&best.d>.016)pressed=false;
  if(!pressed&&prev&&prev.d>.004&&best.d<=.004){pressed=true;try{best.o.userData.onSelect({object:best.o,uv:best.uv,point:tip.clone(),poke:true})}catch(e){console.error(e)}if(p.src&&p.src.hand)roomClick();else haptic(p,.45,14)}
  p.poke={o:best.o,d:best.d,pressed};return best}
 function haptic(p,v,ms){try{p.src?.gamepad?.hapticActuators?.[0]?.pulse(v,ms)}catch(_){}}
 /* Sound of the room itself (bowl, clicks), placed in space: it comes from where things are. */
 const audio={ctx:null,out:null};const lV=V(),lQ=new THREE.Quaternion(),lS=V(),lF=V(),lU=V();
 function roomAudio(){if(audio.ctx){if(audio.ctx.state==='suspended')audio.ctx.resume().catch(()=>{});return audio}const AC=window.AudioContext||window.webkitAudioContext;if(!AC)return null;
  try{audio.ctx=new AC();audio.out=audio.ctx.createGain();audio.out.gain.value=.9;audio.out.connect(audio.ctx.destination)}catch(_){audio.ctx=null;return null}return audio}
 function roomClick(){const a=roomAudio();if(!a)return;const c=a.ctx,t=c.currentTime,o=c.createOscillator(),g=c.createGain();o.type='triangle';o.frequency.setValueAtTime(1500,t);o.frequency.exponentialRampToValueAtTime(900,t+.03);
  g.gain.setValueAtTime(.0001,t);g.gain.exponentialRampToValueAtTime(.05,t+.003);g.gain.exponentialRampToValueAtTime(.0001,t+.06);o.connect(g);g.connect(a.out);o.start(t);o.stop(t+.08)}
 function hearFrom(){if(!audio.ctx)return;const L=audio.ctx.listener,c=presenting()?renderer.xr.getCamera():camera;c.matrixWorld.decompose(lV,lQ,lS);lF.set(0,0,-1).applyQuaternion(lQ);lU.set(0,1,0).applyQuaternion(lQ);
  try{if(L.positionX){L.positionX.value=lV.x;L.positionY.value=lV.y;L.positionZ.value=lV.z;L.forwardX.value=lF.x;L.forwardY.value=lF.y;L.forwardZ.value=lF.z;L.upX.value=lU.x;L.upY.value=lU.y;L.upZ.value=lU.z}else{L.setPosition(lV.x,lV.y,lV.z);L.setOrientation(lF.x,lF.y,lF.z,lU.x,lU.y,lU.z)}}catch(_){}}
 /* Panels whose regions are drawn and hit-tested together (boards, cards): draw(g,W,H,zone) registers zones. */
 function uvPanel(w,h,ppm=1000){const m=panel(w,h,ppm),u=m.userData;u.zones=[];u.hover=null;u.paintFn=null;
  u.redraw=()=>{if(u.paintFn)u.draw((g,W,H)=>{u.zones=[];u.paintFn(g,W,H,(id,x,y,zw,zh,fn)=>{u.zones.push({id,x,y,w:zw,h:zh,fn});return u.hover===id})})};
  u.zoneAt=uv=>{if(!uv)return null;const c=m.material.map.userData.canvas,x=uv.x*c.width,y=(1-uv.y)*c.height;for(let i=u.zones.length-1;i>=0;i--){const z=u.zones[i];if(x>=z.x&&x<=z.x+z.w&&y>=z.y&&y<=z.y+z.h)return z}return null};
  u.onSelect=hit=>{const z=u.zoneAt(hit&&hit.uv);if(z)z.fn(hit)};
  u.hoverUV=uv=>{const z=u.zoneAt(uv),id=z?z.id:null;if(id!==u.hover){u.hover=id;u.redraw()}};
  hits.push(m);return m}
 /* A wooden easel for a board w×h whose centre is cy above the floor. The board and what belongs to it go into
    userData.top; userData.lift(dy) raises or lowers that part, and the legs grow or shrink with it. */
 function easel(w,h,cy){const g=new THREE.Group(),top=new THREE.Group(),fr=.035,d=.03,box=(p,bw,bh,bd,x,y,z,mat=ribWood)=>{const m=new THREE.Mesh(new THREE.BoxGeometry(bw,bh,bd),mat);m.position.set(x,y,z);p.add(m);return m};g.add(top);
  box(top,w+2*fr,fr,d,0,cy+h/2+fr/2,-d/2-.002);box(top,w+2*fr,fr,d,0,cy-h/2-fr/2,-d/2-.002);box(top,fr,h,d,-w/2-fr/2,cy,-d/2-.002);box(top,fr,h,d,w/2+fr/2,cy,-d/2-.002);
  box(top,w,h,.012,0,cy,-d-.004,dark);box(top,w*.92,.025,.08,0,cy-h/2-fr-.012,.01);
  const legs=[-1,1].map(s=>box(g,.04,1,.04,s*(w/2-.08),0,-.035)),back=box(g,.035,1,.035,0,0,-.23);
  g.userData.top=top;g.userData.lift=dy=>{top.position.y=dy;const L=cy-h/2+dy;for(const l of legs){l.scale.y=L;l.position.y=L/2}const T=cy+h/2+dy;back.scale.y=Math.hypot(T,.4);back.position.y=T/2;back.rotation.x=Math.atan2(.4,T)};
  g.userData.lift(0);return g}
 /* The moon as a disc in its phase (as in the app's moon icon). */
 function moonDisc(g,cx,cy,r,m){const p=m.age/29.530588853,k=Math.cos(2*Math.PI*p),rx=Math.abs(k)*r,waxing=p<.5;
  g.save();const halo=g.createRadialGradient(cx,cy,r*.8,cx,cy,r*1.7);halo.addColorStop(0,'rgba(245,230,179,.25)');halo.addColorStop(1,'rgba(245,230,179,0)');g.fillStyle=halo;g.beginPath();g.arc(cx,cy,r*1.7,0,7);g.fill();
  g.fillStyle='#14112e';g.beginPath();g.arc(cx,cy,r,0,7);g.fill();g.fillStyle='#F5E6B3';
  if(m.illumination>=99){g.beginPath();g.arc(cx,cy,r,0,7);g.fill()}
  else if(m.illumination>1){g.beginPath();g.arc(cx,cy,r,-Math.PI/2,Math.PI/2,!waxing);g.ellipse(cx,cy,Math.max(.01,rx),r,0,Math.PI/2,-Math.PI/2,waxing?k>0:k<0);g.closePath();g.fill()}
  g.strokeStyle='rgba(255,255,255,.25)';g.lineWidth=Math.max(1,r*.05);g.beginPath();g.arc(cx,cy,r,0,7);g.stroke();g.restore()}
 /* Writing from anywhere: the surface of light comes to wherever you stand, optionally with a first line. */
 function writeWith(text){wristHide();if(bk.view==='write'||bk.saving)return;if(text&&!draft.text.trim()&&!draft.strokes.length)draft.text=String(text).slice(0,20000);startWrite()}
 /* The menu at the hand: turn a palm towards you (hand tracking) or press A or X (controllers). */
 const wrist=new THREE.Group();wrist.visible=false;scene.add(wrist);
 {const back=panel(.215,.1,2400);back.userData.draw((g,W,H)=>{g.fillStyle='rgba(30,19,12,.92)';rr(g,0,0,W,H,46);g.fill();g.strokeStyle='rgba(233,184,114,.55)';g.lineWidth=6;rr(g,7,7,W-14,H-14,40);g.stroke()});back.position.z=-.002;back.renderOrder=4;wrist.add(back)}
 const wristClock=panel(.19,.026,4000);wristClock.position.y=.031;wrist.add(wristClock);
 for(const b of [...row(wrist,[['Mitte',goHome,.043],['Tafel',()=>goStation('tag'),.043],['Stapel',()=>goStation('stapel'),.043],['Schale',()=>goStation('schale'),.043]],.001,{h:.024,gap:.005,ppm:4000}),
  ...row(wrist,[['Tarot',()=>goStation('tarot'),.043],['Sigillen',()=>goStation('sigil'),.043],['Notizbuch',()=>{wristHide();openBook()},.043],['Weniger',()=>toggleCalm(),.043]],-.029,{h:.024,gap:.005,ppm:4000})])b.userData.wrist=true;
 wristCalm=wrist.children.find(c=>c.userData.label==='Weniger');wristCalm.userData.setActive(prefs.calm);
 const wr={p:null,on:false,hand:false,lost:0,palm:new WeakMap(),clock:''},wrV=V(),wrQ=new THREE.Quaternion(),wrN=V(),wrH=V(),wrT=V();
 function wristHide(){wr.on=false;wr.p=null;wr.hand=false;wrist.visible=false}
 function wristToggle(p){if(wr.on&&wr.p===p)return wristHide();wr.on=true;wr.p=p;wr.hand=false}
 function updateWrist(now){
  renderer.xr.getCamera().getWorldPosition(wrH);
  for(const p of pens){if(!p.src||!p.src.hand)continue;const j=p.hand.joints.wrist;if(!j||!j.visible){wr.palm.delete(p);continue}
   j.getWorldPosition(wrV);j.getWorldQuaternion(wrQ);wrN.set(0,-1,0).applyQuaternion(wrQ);wrT.copy(wrH).sub(wrV);const d=wrT.length(),f=wrN.dot(wrT.divideScalar(d||1)),mine=wr.on&&wr.hand&&wr.p===p;
   if(f>(mine?.45:.72)&&d<(mine?.75:.6)){if(!wr.palm.has(p))wr.palm.set(p,now);wr.lost=0;if(!wr.on&&now-wr.palm.get(p)>250){wr.on=true;wr.p=p;wr.hand=true}}
   else{wr.palm.delete(p);if(mine){wr.lost=wr.lost||now;if(now-wr.lost>450)wristHide()}}}
  const p=wr.p;if(!wr.on||!p||!p.src){wrist.visible=false;return}
  /* Hands: in front of the palm (its normal is -Y of the wrist joint, -Z points into the palm). */
  if(wr.hand){const j=p.hand.joints.wrist;j.getWorldPosition(wrV);j.getWorldQuaternion(wrQ);wrN.set(0,-1,0).applyQuaternion(wrQ);wrV.addScaledVector(wrN,.07).addScaledVector(wrT.set(0,0,-1).applyQuaternion(wrQ),.06)}
  else{(p.grip.visible!==false?p.grip:p.c).getWorldPosition(wrV);wrV.y+=.1}
  wrist.position.copy(wrV);wrist.lookAt(wrH);wrist.visible=true;
  const text=hhmm(Date.now())+' · '+new Date().toLocaleDateString('de-DE',{weekday:'short',day:'numeric',month:'short'});
  if(text!==wr.clock){wr.clock=text;wristClock.userData.draw((g,W,H)=>{g.fillStyle='#fbe8c6';let fs=Math.round(H*.62);g.font='700 '+fs+'px '+FONT;while(fs>12&&g.measureText(text).width>W*.94){fs--;g.font='700 '+fs+'px '+FONT}g.textAlign='center';g.textBaseline='middle';g.fillText(text,W/2,H/2+2)})}
 }
 /* Everything a station may use. */
 const kit={THREE,scene,camera,renderer,rig,hits,prefs,V,C,at,R,rnd,lerp,clamp,smooth,RAD,dayKey,hhmm,FONT,SERIF,PPM,
  canvasTex,panel,infoPanel,button,row,wrap,rr,facing,place,sprite,shadow,glow:{warm:GLOW_WARM,soft:GLOW_SOFT,ink:GLOW_INK},mat:{wood,dark,ribWood,leather},candle,lights,
  say,presenting,tween,uvPanel,easel,moonDisc,cardFace,homeButton,go:goStation,home:goHome,write:writeWith,station:id=>stations[id],setTime:m=>{setTime(m);save();raumControls()},
  tarotDaily:()=>tarotDaily(),tarotShow:i=>tarotShow(i),tarotLay:(i,label)=>{tarotClear();const c=tarotCard(i,0,label||'');c.userData.target=0;setTimeout(()=>tarotShow(i),500)},
  pens,tip:pokeTip,haptic,audio:roomAudio,click:roomClick,headWorld,calm:()=>prefs.calm,leaveVR:()=>renderer.xr.getSession()?.end()};
 for(const def of RAUM_STATIONS){building=def.id;try{const s=def.build(kit);if(s){s.id=def.id;s.label=s.label||def.label;stations[def.id]=s;built.push(s)}}catch(e){console.error('Himmelsraum: Station '+def.id,e)}}
 /* ---------- Loop ---------- */
 let running=false,last=performance.now(),seaT=0;
 const goalV=V(),scaleV=V(),liftV=V(0,.3,-.05);
 function frame(){
  const now=performance.now(),real=Math.min(.5,(now-last)/1000),dt=Math.min(.1,real),t=now/1000,xr=presenting();last=now;
  if(!xr&&document.getElementById('appMain')?.dataset.view!=='raum'){pause();return}
  if(prefs.time==='echt'&&Math.abs(aim-Date.now())<7200000)aim=Date.now();
  const diff=aim-shown;if(Math.abs(diff)>20000){shown+=diff*Math.min(1,dt*.7);applySky(shown);lastSky=now}else{shown=aim;if(now-lastSky>2000){applySky(shown);lastSky=now}}
  const calm=prefs.calm;if(!calm)starU.time.value=t;starU.px.value=xr?1.5:renderer.getPixelRatio();seaT+=dt*(calm?.3:1);seaU.time.value=seaT;if(!calm)clouds.rotation.y+=dt*.0016;windU.time.value=t;
  for(const f of flames){const k=calm?.95:.86+.14*Math.sin(t*9+f.userData.ph)+.06*Math.sin(t*23+f.userData.ph*3);f.scale.set(f.userData.base*k*.8,f.userData.base*k*1.25,1)}
  for(const L of Object.values(lights))L.intensity=(L.userData.base||1)*(calm?.96:.92+.08*Math.sin(t*7.3+L.position.x*3));
  if(nightF>.02&&!calm){for(let i=0;i<70;i++){const b=flyBase[i],w=t*.35+b[3];flyPos[i*3]=b[0]+Math.sin(w*1.3)*.6;flyPos[i*3+1]=b[1]+Math.sin(w*.9)*.25;flyPos[i*3+2]=b[2]+Math.cos(w*1.1)*.6}flyGeo.attributes.position.needsUpdate=true}
  orbFade+=((prefs.breath&&bk.view==='closed'?1:0)-orbFade)*Math.min(1,dt*3);orb.visible=orbFade>.02;
  if(orb.visible){const c=t%10,inh=c<4,k=inh?c/4:1-(c-4)/6,e=k*k*(3-2*k);orbBall.scale.setScalar((.032+.03*e)/.1);orbBall.material.opacity=.85*orbFade;orbHalo.scale.setScalar(.2+.22*e);orbHalo.material.opacity=(.3+.35*e)*orbFade;const w=inh?'einatmen':'ausatmen';if(w!==orbWord){orbWord=w;orbLabel.userData.draw((g,W,H)=>{g.fillStyle='rgba(251,232,198,.9)';g.font='600 '+Math.round(H*.55)+'px '+FONT;g.textAlign='center';g.textBaseline='middle';g.fillText(w,W/2,H/2)})}orbLabel.material.opacity=orbFade}
  for(const g of tarot.cards){const u=g.userData;u.pivot.rotation.y+=(u.target-u.pivot.rotation.y)*Math.min(1,dt*6);u.rise=Math.min(1,u.rise+dt*2);g.position.y=-.08+.08*(1-Math.pow(1-u.rise,3))+Math.sin(t*.9+u.ph)*.004}
  for(const m of sig.items){const u=m.userData,act=sig.active===m,charging=act&&sig.charge&&!sig.charge.done;
   if(act)goalV.set(0,.04,.12);else if(sig.active)goalV.copy(u.home).add(liftV);else goalV.copy(u.home).setY(u.home.y+Math.sin(t*.8+u.ph)*.015);
   m.position.lerp(goalV,Math.min(1,dt*3));const sc=act?(charging?2.3+.25*Math.sin(t*2*Math.PI/10):2):sig.active?.6:.95;m.scale.lerp(scaleV.setScalar(sc),Math.min(1,dt*3));m.rotation.y=act?0:Math.sin(t*.4+u.ph)*.5;u.mat.opacity=sig.active&&!act?.45:1;u.halo.material.opacity=act?(.45+.35*Math.sin(t*2*Math.PI/10)):.28}
  if(sig.charge&&!sig.charge.done){const p=Math.min(1,(now-sig.charge.start)/(sig.charge.minutes*60000)),lit=Math.floor(p*72);for(let i=0;i<72;i++)ring.setColorAt(i,i<lit?COL_ON:COL_OFF);ring.instanceColor.needsUpdate=true;veil.material.opacity+=(.62-veil.material.opacity)*Math.min(1,dt);if(p>=1)sgEnd(false)}else veil.material.opacity+=(0-veil.material.opacity)*Math.min(1,dt*.8);
  for(let i=sig.dissolve.length-1;i>=0;i--){const d=sig.dissolve[i];d.t+=dt;const a=d.pts.geometry.attributes.position;for(let k=0;k<a.count;k++)a.setXYZ(k,a.getX(k)+d.vel[k*3]*dt,a.getY(k)+d.vel[k*3+1]*dt,a.getZ(k)+d.vel[k*3+2]*dt);a.needsUpdate=true;d.pts.material.opacity=Math.max(0,1-d.t/4);if(d.t>4){scene.remove(d.pts);d.pts.geometry.dispose();d.pts.material.dispose();sig.dissolve.splice(i,1)}}
  runTweens(real);runView(real);
  if(kbs.flash&&now-kbs.flashT>140){kbs.flash=null;if(kb.visible)kbDraw()}
  if(kb.visible&&now-caretT>530){caret=!caret;caretT=now;drawPane()}
  if(dictBtn)dictBtn.userData.setLabel(pulseDictation?'Stopp':'Diktieren');
  if(leaveBtn.visible!==xr){leaveBtn.visible=xr;centerTools()}if(note.visible&&now>noteUntil)note.visible=false;
  if(xr)updateXR(now);else wrist.visible=false;
  runFade(real);for(const b of homeBtns)b.visible=xr&&hub.at!==null&&b.userData.station===hub.at;
  for(const s of built){s.dim=calm&&hub.at!==s.id;try{s.update?.(dt,t,now,xr)}catch(e){console.error(e);s.update=null}}
  for(const m of pressing){const u=m.userData,k=(now-u.pressT)/170;if(k>=1){m.position.z=u.baseZ;u.pressT=null;pressing.delete(m)}else m.position.z=u.baseZ-.005*Math.sin(Math.PI*k)}
  hearFrom();
  pultPanel.visible=bk.view==='closed';inkUpload();
  renderer.render(scene,camera);
 }
 function resize(){if(presenting())return;const r=canvas.parentElement.getBoundingClientRect(),w=Math.max(1,Math.round(r.width)),h=Math.max(1,Math.round(r.height));renderer.setSize(w,h,false);camera.aspect=w/h;camera.updateProjectionMatrix()}
 const ro=new ResizeObserver(resize);ro.observe(canvas.parentElement);resize();
 function resume(){if(running)return;running=true;last=performance.now();renderer.setAnimationLoop(frame);if(audio.ctx&&audio.ctx.state==='suspended')audio.ctx.resume().catch(()=>{})}
 function pause(){if(document.fullscreenElement?.id==='raumStage')document.exitFullscreen?.().catch(()=>{});if(!running)return;running=false;renderer.setAnimationLoop(null);if(soundOn){PulseSoundscape.play('');soundOn=false;markSound()}if(bk.view==='write')persistDraft();for(const s of built)try{s.pause?.()}catch(_){}if(audio.ctx&&audio.ctx.state==='running')audio.ctx.suspend().catch(()=>{})}
 async function enterVR(){
  if(!navigator.xr)return toast('Dieser Browser kann kein VR.');
  try{const session=await navigator.xr.requestSession('immersive-vr',{optionalFeatures:['local-floor','bounded-floor','hand-tracking']});
   await renderer.xr.setSession(session);rig.position.set(0,0,0);rig.rotation.y=0;hub.at=null;if(prefs.sound)setSound(prefs.sound,true);resume();if(bk.view==='write')drawPane();
   setTimeout(()=>{if(presenting())say('Menü an der Hand: A- oder X-Taste, ohne Controller die Handfläche zu dir drehen.',5000)},1500);
   session.addEventListener('end',()=>{rig.position.set(0,0,0);rig.rotation.y=0;hub.at=null;for(const st of Object.values(stations))st.lift?.(0);fade=null;fadeBall.visible=false;wristHide();camera.fov=70;camera.position.set(0,1.35,0);look();resize();for(const p of pens){p.line.visible=p.nib.visible=p.body.visible=p.dot.visible=p.tip.visible=false;p.joints.count=0;p.src=null;p.down=false;p.poke=null}note.visible=false;kbShow(false);if(bk.view==='write'){persistDraft();drawPane()}for(const s of built)try{s.leave?.()}catch(_){}raumControls()})}
  catch(e){toast('VR ließ sich nicht starten: '+(e&&e.message||e))}
 }
 function refresh(){
  sgLoad(false);timeBtns.forEach(b=>b.userData.setActive(b.userData.key===prefs.time));markSound();breathBtn.userData.setActive(prefs.breath);
  if(bk.view==='read'){const stamp=raumPages().map(x=>x.id+'@'+x.updatedAt).join('|');if(stamp!==bk.stamp){const atEnd=bk.index>=bk.spreads.length-1;bk.spreads=bookSpreads();bk.index=clamp(atEnd?bk.spreads.length-1:bk.index,0,Math.max(0,bk.spreads.length-1));drawSpread()}}
  for(const s of built){try{s.refresh?.()}catch(e){console.error(e)}}
 }
 function dispose(){pause();for(const s of built)try{s.dispose?.()}catch(_){}try{audio.ctx?.close()}catch(_){}ro.disconnect();window.removeEventListener('keydown',onKey);toastObs?.disconnect();scene.traverse(o=>{o.geometry?.dispose?.();const m=o.material;for(const x of Array.isArray(m)?m:m?[m]:[]){x.map?.dispose?.();x.dispose?.()}});renderer.dispose()}
 return {setTime,setSound:k=>setSound(k,false),setBreath,enterVR,resume,pause,refresh,dispose,openBook:()=>{if(bk.view!=='write')openBook()},write:()=>{if(bk.view!=='write')startWrite()},setText,
  debug:{scene,camera,renderer,look:(y,p)=>{yaw=y;pitch=p;look()},jump:mode=>{setTime(mode);shown=aim;applySky(shown)},tarotDaily,tarotThree,tarot,sgFocus,sgStart,sgEnd,sgForget,sig,bk,draft,finishWrite,closeBook,
   select:label=>{const b=hits.find(o=>o.userData.label===label&&visible(o));if(b)b.userData.onSelect();return !!b},
   settled:()=>!viewAnim&&!tweens.length&&!fade,objects:{closedBook,paneMesh,book,pane,kb,wrist},
   go:goStation,home:goHome,hub,stations,headWorld,rigTo,wristToggle:i=>wristToggle(pens[i]),wr,toScreen:o=>{o.updateWorldMatrix(true,false);const p=o.getWorldPosition(V()).project(camera),r=canvas.getBoundingClientRect();return {x:r.left+(p.x+1)/2*r.width,y:r.top+(1-p.y)/2*r.height}},
   scribble:()=>{const s=[];draft.strokes.push(s);for(let i=0;i<=80;i++){const a=i/80*Math.PI*6;strokeAdd(s,-.28+i*.006,.04+Math.sin(a)*.045,.08)}persistSoon()}}};
}
