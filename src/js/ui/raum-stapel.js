// SOURCE: ui/raum-stapel.js
/* Himmelsraum, the daily stack (back right): today's cards on an easel, large enough to read in VR, with
   their pictures; long cards have pages. The stack lies on a small table, and with every step a card moves
   onto the done pile. It is turned over only when you come to it, so opening the room marks nothing as seen.
   Videos cannot play inside VR: "Im Browser ansehen" ends VR and opens the same card in the app. */
RAUM_STATIONS.push({id:'stapel',label:'Stapel',build(k){
 const {THREE}=k,A=k.at(-148,2.5),g=k.facing(new THREE.Group(),A.x,0,A.z,0);k.scene.add(g);
 const W=1.25,H=.82,CY=1.45,CW=1250,CH=820,BAND=290,P=48,GAP=34,COLW=(CW-P*2-GAP)/2,TOP=96,BOT=CH-62,F=k.FONT;
 g.add(k.easel(W,H,CY));
 const card=k.uvPanel(W,H,1000);card.position.set(0,CY,.004);g.add(card);
 const BG={geist:['#0F766E','#0B3B37'],kosmos:['#312E81','#0B1026'],magie:['#6D28D9','#2E1065'],stimme:['#BE185D','#4A044E'],kunst:['#C2410C','#6B2109'],schreiben:['#1D4ED8','#172554'],
  tarot:['#4C1D95','#1E1B4B'],sky:['#1E1B4B','#05060F'],own:['#334155','#0F172A'],end:['#047857','#022C22'],web:['#3F3F46','#09090B'],video:['#7F1D1D','#1C0A0A'],cover:['#6a2a38','#1f0c12']};
 const mc=document.createElement('canvas').getContext('2d');
 const st={revealed:false,day:'',pos:-1,page:0,stamp:'',v:null,L:null,alpha:1,tick:0,actKey:null};
 const fit=(c,text,max)=>{let s=String(text||'');if(c.measureText(s).width<=max)return s;while(s.length>1&&c.measureText(s+'…').width>max)s=s.slice(0,-1);return s.trimEnd()+'…'};
 /* ---------- Pictures: card art (SVG), pictures of the day, video thumbnails (only where the server allows it) ---------- */
 const imgs=new Map();
 function img(key,src,cors){let r=imgs.get(key);if(r)return r.ok?r.im:null;r={im:new Image(),ok:false,failed:false};imgs.set(key,r);if(cors)r.im.crossOrigin='anonymous';r.im.referrerPolicy='no-referrer';
  r.im.onload=()=>{r.ok=true;relayout()};r.im.onerror=()=>{r.failed=true;relayout()};r.im.src=typeof src==='function'?src():src;return null}
 const imgFailed=key=>!!(imgs.get(key)&&imgs.get(key).failed);
 const svgSrc=c=>()=>'data:image/svg+xml;charset=utf-8,'+encodeURIComponent(stapelArt(c).replace('<svg ','<svg xmlns="http://www.w3.org/2000/svg" width="1080" height="600" '));
 function cover(c,im,x,y,w,h,alpha=1){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height;if(!iw||!ih)return;const s=Math.max(w/iw,h/ih),sw=w/s,sh=h/s;c.save();c.globalAlpha=alpha;c.drawImage(im,(iw-sw)/2,(ih-sh)/2,sw,sh,x,y,w,h);c.restore()}
 function contain(c,im,x,y,w,h){const iw=im.naturalWidth||im.width,ih=im.naturalHeight||im.height,s=Math.min(w/iw,h/ih),dw=iw*s,dh=ih*s,r={x:x+(w-dw)/2,y:y+(h-dh)/2,w:dw,h:dh};c.drawImage(im,r.x,r.y,r.w,r.h);return r}
 /* ---------- What the current card says ---------- */
 const paras=t=>String(t||'').split('\n\n').map(s=>s.trim()).filter(Boolean).map(text=>({t:'p',text}));
 const missing=text=>({kind:'missing',ref:'',colors:BG.own,kicker:'Stapel',title:'Weg',art:{type:'none'},blocks:[{t:'p',text}],keep:null,actions:[]});
 function actFor(c){
  if(c.act==='write')return [['Aufschreiben',()=>k.write(c.title+'\n'+(c.ask||c.try||'')+'\n')]];
  if(c.act==='timer'&&k.station('schale')&&k.station('schale').meditate)return [['Mit der Klangschale · '+(c.min||5)+' Min.',()=>{k.go('schale');setTimeout(()=>k.station('schale').meditate(c.min||5),420)}]];
  if(c.act==='tarot')return [['Zur Tarotecke',()=>k.go('tarot')]];
  if(c.act==='sigil')return [['Zur Sigillenecke',()=>k.go('sigil')]];
  if(c.act==='sky')return [['Nachthimmel zeigen',()=>{k.setTime('nacht');k.say('Der Himmel von heute Nacht über Wuppertal.')}]];
  return []}
 function view(d){
  if(!st.revealed){const today=d.day===key()&&d.cards.length,n=today?d.cards.length:d.size,pos=today?d.pos:0;
   return {kind:'cover',ref:'',colors:BG.cover,kicker:'Für heute',title:'Dein Stapel',art:{type:'stack'},keep:null,actions:[],
    blocks:[{t:'p',text:today&&pos>=n?'Für heute durch. Morgen liegt ein neuer bereit.':pos?'Weiter bei Karte '+(pos+1)+' von '+n+'.':n+' Karten: Gedanken, Übungen, deine Videos, eine Tarotkarte, der Himmel.'},{t:'small',text:'Zum Aufdecken auf die Karte zeigen oder „Aufdecken“ drücken.'}]}}
  const entry=d.cards[d.pos];
  if(!entry){const s=PulseDeck.summary(db),kept=d.stats.kept||0,watched=d.stats.watched||0;
   return {kind:'end',ref:'',colors:BG.end,kicker:'Für heute',title:'Stapel durch',art:{type:'check'},keep:null,actions:[],
    blocks:[{t:'p',text:d.cards.length+' Karten'+(kept?' · '+kept+' behalten':'')+(watched?' · '+watched+(watched===1?' Video':' Videos')+' gesehen':'')},{t:'p',text:'Morgen liegt ein neuer Stapel bereit. Bis dahin ist hier Schluss, mit Absicht.'},...(s.days>1?[{t:'small',text:s.days+' Stapel-Tage bisher · '+s.kept+' Karten in deiner Sammlung'}]:[])]}}
  const ref=entry.ref,type=entry.type;
  if(type==='card'){const c=PulseCards.get(ref.slice(2));if(!c)return missing('Diese Karte gibt es nicht mehr.');const T=PulseCards.TOPICS[c.topic]||{name:''};
   return {kind:'card',ref,colors:BG[c.topic]||BG.own,kicker:PulseCards.KINDS[c.kind]+' · '+T.name,title:c.title,art:{type:'svg',key:'svg:'+c.id,src:svgSrc(c)},keep:PulseDeck.isKept(db,ref),actions:actFor(c),
    blocks:[...paras(c.text),...(c.try?[{t:'box',label:'Probier das',text:c.try}]:[]),...(c.ask?[{t:'box',label:'Zum Mitnehmen',text:c.ask}]:[]),...(c.read?[{t:'small',text:'Weiter: '+c.read}]:[])]}}
  if(type==='tarot'){const i=Number(ref.slice(2)),t=PulseLibrary.TAROT[i];if(!t)return missing('Diese Karte gibt es nicht.');
   const studied=Object.keys(d.seen).filter(x=>x.startsWith('t:')).length,note=(tarotPrefs().tarotNotes||{})[i]||'';
   return {kind:'tarot',ref,colors:BG.tarot,kicker:'Tarot lernen · '+Math.min(studied,78)+' von 78 angeschaut',title:t.name,sub:t.wildUnknown?'In The Wild Unknown: '+t.wildUnknown:'',art:{type:'tarot',index:i},keep:PulseDeck.isKept(db,ref),
    actions:[['Auf den Tarottisch legen',()=>{k.go('tarot');setTimeout(()=>k.tarotLay(i,'Zum Lernen'),420)}]],
    blocks:[{t:'fact',label:'Bedeutung',text:t.keywords},{t:'fact',label:'Umgekehrt',text:t.reversed},{t:'box',label:'Eine Frage dazu',text:t.question},...(note?[{t:'box',label:'Deine Bedeutung',text:note}]:[{t:'small',text:'Such die Karte in deinen Decks und schau sie dir an, bevor du weiterliest.'}])]}}
  if(type==='video'){const x=PulseVault.get(db,'yt-'+ref.slice(2));if(!x)return missing('Dieses Video ist nicht mehr in deiner Sammlung.');
   const shelves=x.shelves.map(vaultShelfName).filter(Boolean).join(' · '),thumb=vaultImg(x,'hq');
   return {kind:'video',ref,colors:BG.video,kicker:'Aus deiner Sammlung · '+vaultNo(x.no)+(shelves?' · '+shelves:''),title:x.title||'Video '+vaultNo(x.no),art:thumb?{type:'img',key:'img:'+thumb,url:thumb,play:true}:{type:'none'},keep:null,
    actions:[[x.fav?'★ Favorit':'☆ Favorit',()=>{stapelVideo(x.id,'fav');refresh(true)}],[x.status==='gesehen'?'✓ Gesehen':'Schon gesehen',()=>{stapelVideo(x.id,'seen');refresh(true)}],['Im Browser ansehen',()=>watch()]],
    blocks:[{t:'p',text:[x.channel,stapelAge(x.addedAt)+' auf deiner Liste',x.status==='gesehen'?'gesehen':''].filter(Boolean).join(' · ')},{t:'small',text:'In der Brille laufen keine Videos. „Im Browser ansehen“ beendet VR und öffnet genau diese Karte im Stapel.'}]}}
  if(type==='own'){const x=PulseLife.get(db,ref.slice(2));if(!x)return missing('Diese Notiz gibt es nicht mehr.');const room=PulseLife.room(x.room);
   return {kind:'own',ref,colors:BG.own,kicker:'Von dir · '+stapelAge(x.createdAt).replace('seit ','vor ')+' · '+room.name,title:x.title,art:{type:'none'},keep:null,
    actions:[['Weiterschreiben',()=>k.write(x.title+' – weitergedacht\n')]],
    blocks:x.body?paras(x.body.slice(0,1600)+(x.body.length>1600?' …':'')):[{t:'small',text:'Nur ein Titel. Was meintest du damals?'}]}}
  if(type==='web'){const src=ref.split(':')[1],S=PulseDaily.SOURCES[src]||{name:'Aus dem Netz',short:'dem Netz',lang:'de'},c=d.webCache[ref],x=entry.data||(c&&c.data);
   if(!x)return {kind:'web',ref,colors:BG.web,kicker:S.name,title:c&&c.fail?'Heute nicht erreichbar':'Wird geladen …',art:{type:'none'},keep:null,actions:[],
    blocks:[{t:'small',text:c&&c.fail?'Kein Netz, oder der Dienst antwortet gerade nicht. In einer Stunde versucht PULSE es noch einmal.':'Kommt direkt von '+S.short+'. Gesendet wird nur die Adresse des Tages.'}]};
   return {kind:'web',ref,colors:BG.web,kicker:S.name+(S.lang==='en'?' · Englisch':''),title:x.title,art:x.img?{type:'img',key:'img:'+x.img,url:x.img,side:true}:{type:'none'},keep:PulseDeck.isKept(db,ref),actions:[],
    blocks:[...(x.sub?[{t:'small',text:x.sub}]:[]),...paras(x.text),...(x.credit?[{t:'small',text:x.credit}]:[])]}}
  if(type==='sky'){const date=key(),m=cosmosMoon(date),sign=PulseAstro.moonSign(cosmosNoon(date)),planet=PulseAstro.dayRuler(date),PL=PulseLore.PLANETS[planet]||{themes:''},PH=PulseLore.PHASES[m.index],fests=cosmosFests(date),sun=PulseAstro.sunTimes(date);
   return {kind:'sky',ref,colors:BG.sky,kicker:'Himmel heute · '+m.illumination+' % beleuchtet',title:m.name,sub:'Mond in '+sign.glyph+' '+sign.name,art:{type:'moon',m},keep:null,
    actions:[['Nachthimmel zeigen',()=>{k.setTime('nacht');k.say('Der Himmel von heute Nacht über Wuppertal.')}]],
    blocks:[{t:'p',text:PulseLore.SIGN_TEXT[sign.name]||''},...(fests.length?[{t:'box',label:'Heute',text:fests.map(f=>f.name).join(' · ')}]:[]),{t:'fact',label:'Planetentag',text:PulseAstro.PLANET_GLYPH[planet]+' '+planet+' · '+PL.themes},
     ...(sun?[{t:'fact',label:'Sonne',text:'Aufgang '+cosmosTime(sun.rise)+' · Untergang '+cosmosTime(sun.set)}]:[]),...(PH?[{t:'box',label:PH.title,text:PH.text}]:[])]}}
  return missing('Unbekannte Karte.')}
 /* ---------- Layout: text flows through columns and pages ---------- */
 const STY={p:{f:'400 27px ',col:'#f3e6d0',lh:38,after:14},label:{f:'700 20px ',col:'#e9b872',lh:30},box:{f:'400 26px ',col:'#fbe8c6',lh:36,after:18},small:{f:'italic 400 23px ',col:'#bba88c',lh:32,after:10},fact:{f:'400 26px ',col:'#f3e6d0',lh:36,after:14}};
 function flow(blocks,first,rest){
  const pages=[[]];let cols=first,ci=0,y=cols[0].y0;
  const brk=()=>{ci++;if(ci>=cols.length){pages.push([]);cols=rest;ci=0}y=cols[ci].y0};
  const room=lh=>y+lh<=cols[ci].y1;
  const put=(s,text,ind,bar)=>{if(!room(s.lh))brk();const c=cols[ci];pages[pages.length-1].push({x:c.x+ind,y:y+Math.round(s.lh*.74),f:s.f,col:s.col,text,bar:bar?{x:c.x,y,h:s.lh}:null});y+=s.lh};
  const text=(s,t,ind=0,bar=false)=>{let left=String(t||'');mc.font=s.f+F;
   while(left&&pages.length<=12){if(!room(s.lh))brk();const lines=k.wrap(mc,left,cols[ci].w-ind);let used=0;
    while(used<lines.length&&room(s.lh)){put(s,lines[used],ind,bar);used++}left=used<lines.length?lines.slice(used).join(' '):''}};
  for(const b of blocks){if(pages.length>12)break;
   if(b.t==='p'||b.t==='small'){text(STY[b.t],b.text);y+=STY[b.t].after}
   else{const bar=b.t==='box',s=bar?STY.box:STY.fact,ind=bar?24:0;if(!room(STY.label.lh+s.lh))brk();put(STY.label,String(b.label||'').toUpperCase(),ind,bar);text(s,b.text,ind,bar);y+=s.after}}
  while(pages.length>1&&!pages[pages.length-1].length)pages.pop();
  return pages}
 function layout(v){
  const rest=[{x:P,y0:TOP,y1:BOT,w:COLW},{x:P+COLW+GAP,y0:TOP,y1:BOT,w:COLW}],a=v.art;
  if(a.type==='tarot'||(a.type==='img'&&a.side&&!imgFailed(a.key))){
   const iw=a.type==='tarot'?400:540,cx=P+iw+44,cw=CW-P-cx;mc.font='700 44px '+F;const tl=k.wrap(mc,v.title,cw).slice(0,3),last=168+(tl.length-1)*52;
   return {side:true,iw,cx,cw,tl,pages:flow(v.blocks,[{x:cx,y0:(v.sub?last+42:last)+34,y1:BOT,w:cw}],rest)}}
  mc.font='700 50px '+F;const tl=k.wrap(mc,v.title,CW-P*2-(a.type==='moon'||a.type==='stack'||a.type==='check'?360:0)).slice(0,2);
  return {side:false,tl,pages:flow(v.blocks,[{x:P,y0:BAND+46,y1:BOT,w:COLW},{x:P+COLW+GAP,y0:BAND+46,y1:BOT,w:COLW}],rest)}}
 /* ---------- Drawing ---------- */
 function play(c,x,y,r){c.fillStyle='rgba(0,0,0,.5)';c.beginPath();c.arc(x,y,r,0,7);c.fill();c.fillStyle='#fff';c.beginPath();c.moveTo(x-r*.32,y-r*.45);c.lineTo(x+r*.5,y);c.lineTo(x-r*.32,y+r*.45);c.closePath();c.fill()}
 function check(c,x,y){c.save();c.strokeStyle='rgba(255,255,255,.85)';c.lineWidth=6;c.lineJoin=c.lineCap='round';c.translate(x,y);c.rotate(-.17);k.rr(c,-70,-80,112,140,14);c.stroke();c.rotate(.24);k.rr(c,-40,-90,112,140,14);c.stroke();c.beginPath();c.moveTo(-10,-14);c.lineTo(12,8);c.lineTo(50,-34);c.stroke();c.restore()}
 function stackArt(c,x,y){c.save();c.translate(x,y);for(let i=0;i<5;i++){c.save();c.rotate((i-2)*.08);c.fillStyle=i===4?'#f3e6d0':'rgba(243,230,208,'+(.18+i*.12)+')';k.rr(c,-78,-108-i*3,156,216,14);c.fill();c.restore()}
  c.strokeStyle='#6a2a38';c.lineWidth=4;k.rr(c,-62,-96,124,190,10);c.stroke();c.restore()}
 function stars(c){const r=PulseDeck.rng('sky:'+key());for(let i=0;i<110;i++){c.fillStyle='rgba(255,255,255,'+(.2+r()*.8).toFixed(2)+')';c.beginPath();c.arc(r()*CW,r()*BAND,.6+r()*1.7,0,7);c.fill()}}
 function band(c,v,L){
  const gr=c.createLinearGradient(0,0,CW,BAND);gr.addColorStop(0,v.colors[0]);gr.addColorStop(1,v.colors[1]);c.fillStyle=gr;c.fillRect(0,0,CW,BAND);const a=v.art;
  if(a.type==='svg'){const im=img(a.key,a.src);if(im)cover(c,im,0,0,CW,BAND,.95)}
  else if(a.type==='img'){const im=img(a.key,a.url,true);if(im)cover(c,im,0,0,CW,BAND);if(a.play)play(c,CW-150,BAND/2-12,52)}
  else if(a.type==='moon'){stars(c);k.moonDisc(c,CW-200,BAND/2,98,a.m)}
  else if(a.type==='check')check(c,CW-220,BAND/2);
  else if(a.type==='stack')stackArt(c,CW-230,BAND/2+12);
  const sh=c.createLinearGradient(0,BAND*.3,0,BAND);sh.addColorStop(0,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(0,0,0,.58)');c.fillStyle=sh;c.fillRect(0,0,CW,BAND);
  let y=BAND-34;if(v.sub){c.fillStyle='rgba(255,255,255,.84)';c.font='italic 400 26px '+F;c.fillText(fit(c,v.sub,CW-P*2),P,y);y-=50}
  c.fillStyle='#fff';c.font='700 50px '+F;for(let i=L.tl.length-1;i>=0;i--){c.fillText(L.tl[i],P,y);y-=58}
  c.fillStyle='rgba(255,255,255,.8)';c.font='700 21px '+F;c.fillText(fit(c,String(v.kicker||'').toUpperCase(),CW-P*2),P,y+14)}
 function sideHead(c,v,L){const a=v.art,x=P,y=TOP-10,w=L.iw,h=BOT-TOP+10;
  if(a.type==='tarot')c.drawImage(k.cardFace(a.index).userData.canvas,x,y,w,w*860/512);
  else{const im=img(a.key,a.url,true);if(im){const r=contain(c,im,x,y,w,h);c.strokeStyle='rgba(255,255,255,.16)';c.lineWidth=2;c.strokeRect(r.x,r.y,r.w,r.h)}else{c.fillStyle='rgba(255,255,255,.04)';c.fillRect(x,y,w,h)}}
  c.fillStyle='#dcb67e';c.font='700 21px '+F;c.fillText(fit(c,String(v.kicker||'').toUpperCase(),L.cw),L.cx,112);
  c.fillStyle='#fbe8c6';c.font='700 44px '+F;L.tl.forEach((l,i)=>c.fillText(l,L.cx,168+i*52));
  if(v.sub){c.fillStyle='#c9b08c';c.font='italic 400 25px '+F;c.fillText(fit(c,v.sub,L.cw),L.cx,168+(L.tl.length-1)*52+42)}}
 function strip(c,v){const gr=c.createLinearGradient(0,0,CW,0);gr.addColorStop(0,v.colors[0]);gr.addColorStop(1,v.colors[1]);c.fillStyle=gr;c.fillRect(0,0,CW,70);c.fillStyle='rgba(255,255,255,.92)';c.font='700 26px '+F;c.fillText(fit(c,v.title,CW-P*2),P,46)}
 function footer(c,d,L,page){const y=CH-30,n=d.cards.length;
  if(st.revealed&&n){const dw=Math.max(8,Math.min(24,560/n-6));for(let i=0;i<n;i++){c.fillStyle=i<d.pos?'#e9b872':i===d.pos?'#fff7e8':'rgba(251,232,198,.22)';k.rr(c,P+i*(dw+6),y-6,dw,10,4);c.fill()}}
  const parts=[];if(st.revealed&&n)parts.push(d.pos<n?'Karte '+(d.pos+1)+' von '+n:'Fertig');if(L.pages.length>1)parts.push('Seite '+(page+1)+' von '+L.pages.length);
  c.textAlign='right';c.fillStyle='#bba88c';c.font='600 22px '+F;c.fillText(parts.join(' · '),CW-P,y+4);c.textAlign='left'}
 function paint(c,Wp,Hp,zone){const v=st.v,L=st.L;if(!v||!L)return;const d=PulseDeck.ensure(db),page=Math.min(st.page,L.pages.length-1);
  c.save();k.rr(c,0,0,Wp,Hp,28);c.clip();c.fillStyle='#16100c';c.fillRect(0,0,Wp,Hp);
  if(page>0)strip(c,v);else if(L.side)sideHead(c,v,L);else band(c,v,L);
  for(const o of L.pages[page]||[]){if(o.bar){c.fillStyle='rgba(233,184,114,.7)';c.fillRect(o.bar.x,o.bar.y+2,5,o.bar.h)}c.font=o.f+F;c.fillStyle=o.col;c.fillText(o.text,o.x,o.y)}
  footer(c,d,L,page);
  if(v.kind==='cover'){const hot=zone('reveal',0,0,Wp,Hp,()=>reveal());if(hot){c.fillStyle='rgba(255,236,200,.07)';c.fillRect(0,0,Wp,Hp)}}
  c.restore();c.strokeStyle='rgba(233,184,114,.45)';c.lineWidth=4;k.rr(c,2,2,Wp-4,Hp-4,27);c.stroke()}
 card.userData.paintFn=paint;
 /* ---------- Buttons under the card ---------- */
 const navY=CY-H/2-.085,actY=navY-.066;
 const prevBtn=k.button('‹ Zurück',.2,.055,()=>step(-1)),keepBtn=k.button('☆ Behalten',.24,.055,()=>keep()),nextBtn=k.button('Weiter ›',.2,.055,()=>step(1));
 prevBtn.position.set(-.26,navY,.06);keepBtn.position.set(0,navY,.06);nextBtn.position.set(.26,navY,.06);g.add(prevBtn,keepBtn,nextBtn);
 k.homeButton(g,W/2-.075,actY,.06);
 let actBtns=[];
 function setActions(list){
  for(const b of actBtns){g.remove(b);const i=k.hits.indexOf(b);if(i>=0)k.hits.splice(i,1);b.material.map.dispose();b.material.dispose();b.geometry.dispose()}
  const ws=list.map(([l])=>Math.min(.34,Math.max(.16,.05+.0135*l.length))),gap=.012,total=ws.reduce((a,b)=>a+b,0)+gap*Math.max(0,list.length-1);let x=-.1-total/2;
  actBtns=list.map(([l,fn],i)=>{const b=k.button(l,ws[i],.05,fn);b.position.set(x+ws[i]/2,actY,.06);x+=ws[i]+gap;g.add(b);return b})}
 function sync(){const d=PulseDeck.ensure(db),v=st.v,pages=st.L?st.L.pages.length:1,end=st.revealed&&d.pos>=d.cards.length;
  prevBtn.visible=st.revealed&&(st.page>0||d.pos>0);
  keepBtn.visible=!!v&&v.keep!==null;if(keepBtn.visible){keepBtn.userData.setLabel(v.keep?'★ Behalten':'☆ Behalten');keepBtn.userData.setActive(!!v.keep)}
  nextBtn.visible=!end;nextBtn.userData.setLabel(!st.revealed?'Aufdecken':st.page<pages-1?'Weiter ›':d.pos===d.cards.length-1?'Fertig ✓':'Weiter ›');
  const acts=v?v.actions:[],ak=acts.map(a=>a[0]).join('|');if(ak!==st.actKey){st.actKey=ak;setActions(acts)}}
 /* ---------- The stack on the table ---------- */
 const TT=.62;
 {const top=new THREE.Mesh(new THREE.CylinderGeometry(.27,.27,.03,32),k.mat.dark);top.position.set(0,TT,.42);const leg=new THREE.Mesh(new THREE.CylinderGeometry(.03,.04,TT,8),k.mat.dark);leg.position.set(0,TT/2,.42);
  const foot=new THREE.Mesh(new THREE.CylinderGeometry(.15,.17,.02,20),k.mat.dark);foot.position.set(0,.01,.42);g.add(top,leg,foot)}
 const backTex=k.canvasTex(128,192,(c,w,h)=>{c.fillStyle='#6a2a38';k.rr(c,0,0,w,h,12);c.fill();c.strokeStyle='#d9b36b';c.lineWidth=5;k.rr(c,9,9,w-18,h-18,8);c.stroke();c.fillStyle='#d9b36b';c.beginPath();c.arc(w/2,h/2,15,0,7);c.fill()});
 const edge=new THREE.MeshLambertMaterial({color:0xefe4cc}),mats=[edge,edge,new THREE.MeshLambertMaterial({map:backTex}),edge,edge,edge];
 const todo=new THREE.Mesh(new THREE.BoxGeometry(.1,1,.15),mats),done=new THREE.Mesh(new THREE.BoxGeometry(.1,1,.15),mats);todo.position.set(-.09,TT,.42);done.position.set(.09,TT,.42);done.rotation.y=.14;g.add(todo,done);
 function piles(d){const today=d.day===key()&&d.cards.length,n=today?d.cards.length:d.size,pos=today?Math.min(d.pos,n):0,th=.0035,a=n-pos,b=pos;
  todo.visible=a>0;todo.scale.y=Math.max(.001,a*th);todo.position.y=TT+.015+a*th/2;done.visible=b>0;done.scale.y=Math.max(.001,b*th);done.position.y=TT+.015+b*th/2}
 const flyGeo=new THREE.BoxGeometry(.1,.003,.15),upright=new THREE.Quaternion().setFromEuler(new THREE.Euler(Math.PI/2,0,0)),flat=new THREE.Quaternion();
 function flyCard(dir){const m=new THREE.Mesh(flyGeo,mats);g.add(m);const top=new THREE.Vector3(.09,done.position.y+done.scale.y/2+.004,.42),panel=new THREE.Vector3(0,CY-.04,.08);
  k.tween(m,{position:dir>0?panel:top,quaternion:dir>0?upright:flat,scale:dir>0?2.3:1},{position:dir>0?top:panel,quaternion:dir>0?flat:upright,scale:dir>0?1:2.3},.6,()=>g.remove(m))}
 /* ---------- State ---------- */
 function stampOf(d){const e=d.cards[d.pos],ref=e?e.ref:'';let extra='';
  if(ref.startsWith('w:')){const c=d.webCache[ref];extra=c?(c.data?'d':c.fail?'f':''):''}
  else if(ref.startsWith('v:')){const x=PulseVault.get(db,'yt-'+ref.slice(2));extra=x?[x.title,x.fav,x.status,x.channel].join('|'):'-'}
  else if(ref.startsWith('t:'))extra=(tarotPrefs().tarotNotes||{})[ref.slice(2)]||'';
  else if(ref.startsWith('o:')){const x=PulseLife.get(db,ref.slice(2));extra=x?x.updatedAt:'-'}
  return [st.revealed,d.day,d.pos,d.cards.length,d.size,ref,PulseDeck.isKept(db,ref),extra].join('§')}
 function refresh(force){
  const d=PulseDeck.ensure(db);if(st.revealed&&d.day!==key())st.revealed=false;
  const s=stampOf(d);if(!force&&s===st.stamp)return;
  const moved=st.revealed&&st.stamp.startsWith('true')&&st.day===d.day&&d.pos!==st.pos?Math.sign(d.pos-st.pos):0;
  if(d.pos!==st.pos||d.day!==st.day)st.page=0;
  st.stamp=s;st.day=d.day;st.pos=d.pos;st.v=view(d);st.L=layout(st.v);st.page=Math.min(st.page,st.L.pages.length-1);
  if(moved){flyCard(moved);st.alpha=0}
  card.userData.redraw();sync();piles(d)}
 function relayout(){if(!st.v)return;st.L=layout(st.v);st.page=Math.min(st.page,st.L.pages.length-1);card.userData.redraw();sync()}
 function reveal(){if(st.revealed)return;st.revealed=true;if(stapelPrepare())save();stapelPrefetch();refresh(true)}
 function step(dir){
  if(!st.revealed)return reveal();
  const d=PulseDeck.ensure(db),pages=st.L?st.L.pages.length:1;
  if(dir>0&&st.page<pages-1){st.page++;card.userData.redraw();sync();return}
  if(dir<0&&st.page>0){st.page--;card.userData.redraw();sync();return}
  const to=d.pos+dir;if(to<0||to>d.cards.length)return;stapelGo(to);refresh(true)}
 function keep(){const v=st.v;if(!v||!v.ref||v.keep===null)return;stapelKeep(v.ref);refresh(true)}
 function watch(){k.leaveVR();setTimeout(()=>goView('stapel'),250)}
 refresh(true);
 return {anchor:card,stand:1.1,width:1.5,refresh:()=>refresh(false),enter:()=>reveal(),
  update(dt,t,now){if(st.alpha<1){st.alpha=Math.min(1,st.alpha+dt*3.2);card.material.opacity=.1+.9*st.alpha}if(now-st.tick>1000){st.tick=now;refresh(false)}},
  debug:{st,step,reveal,keep}};
}});
