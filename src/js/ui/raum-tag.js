// SOURCE: ui/raum-tag.js
/* Himmelsraum, day board (back left, on an easel): the date, sun and moon, today's appointments and tasks.
   A task is ticked off by pointing at it or by pressing it with a fingertip. The daily card and the stack
   lead on to their stations. Only shown in VR; on the phone it simply stands in the room. */
RAUM_STATIONS.push({id:'tag',label:'Tafel',build(k){
 const {THREE}=k,A=k.at(148,2.5),g=k.facing(new THREE.Group(),A.x,0,A.z,0);k.scene.add(g);
 const W=1.2,H=.78,CY=1.42;g.add(k.easel(W,H,CY));
 const board=k.uvPanel(W,H,1000);board.position.set(0,CY,.004);g.add(board);
 k.homeButton(g,0,CY-H/2-.1,.06);
 let data=null,stamp='',tick=0;
 const hm=()=>{const d=new Date();return String(d.getHours()).padStart(2,'0')+':'+String(d.getMinutes()).padStart(2,'0')};
 function collect(){
  const date=key(),now=hm(),b=PulseRaum.dayBoard({day:PulseLife.day(db,date),all:PulseLife.list(db),date,hm:now});
  const m=cosmosMoon(date),sun=PulseAstro.sunTimes(date),card=libTodayCard(),d=PulseDeck.ensure(db),today=d.day===date&&d.cards.length>0;
  return {date,hm:now,greet:lifeGreeting(),b,moon:{name:m.name,illumination:m.illumination,age:m.age},sun:sun?{rise:cosmosTime(sun.rise),set:cosmosTime(sun.set)}:null,
   card:card?{index:card.index,name:card.card.name,keys:String(card.card.keywords||'').split(' – ')[0]}:null,
   deck:{n:today?d.cards.length:d.size,pos:today?Math.min(d.pos,d.cards.length):0,done:today&&d.pos>=d.cards.length}};
 }
 const fit=(c,text,max)=>{let s=String(text||'');if(c.measureText(s).width<=max)return s;while(s.length>1&&c.measureText(s+'…').width>max)s=s.slice(0,-1);return s.trimEnd()+'…'};
 function box(c,x,y,w,h,hot){c.fillStyle=hot?'rgba(233,184,114,.2)':'rgba(255,240,215,.055)';k.rr(c,x,y,w,h,18);c.fill();c.strokeStyle=hot?'rgba(255,225,170,.9)':'rgba(233,184,114,.35)';c.lineWidth=3;k.rr(c,x+1.5,y+1.5,w-3,h-3,17);c.stroke()}
 function paint(c,Wp,Hp,zone){
  const D=data;if(!D)return;const P=48,F=k.FONT;
  c.fillStyle='rgba(28,20,14,.97)';k.rr(c,0,0,Wp,Hp,28);c.fill();c.strokeStyle='rgba(233,184,114,.45)';c.lineWidth=4;k.rr(c,10,10,Wp-20,Hp-20,22);c.stroke();
  c.fillStyle='#dcb67e';c.font='700 24px '+F;c.fillText(('Heute · '+D.greet).toUpperCase(),P,68);
  c.fillStyle='#fbe8c6';c.font='700 56px '+k.SERIF;c.fillText(fit(c,lifeDate(D.date,{weekday:'long',day:'numeric',month:'long'}),Wp-P*2-260),P,130);
  c.fillStyle='#d8c3a0';c.font='400 27px '+F;c.fillText([D.sun?'Sonne '+D.sun.rise+' – '+D.sun.set:'',D.moon.name+' · '+D.moon.illumination+' %'].filter(Boolean).join('   ·   '),P,176);
  k.moonDisc(c,Wp-P-44,104,40,D.moon);c.textAlign='right';c.fillStyle='#fbe8c6';c.font='700 46px '+F;c.fillText(D.hm,Wp-P-108,120);c.textAlign='left';
  c.strokeStyle='rgba(233,184,114,.28)';c.lineWidth=2;c.beginPath();c.moveTo(P,206);c.lineTo(Wp-P,206);c.moveTo(Wp/2,228);c.lineTo(Wp/2,610);c.stroke();
  const colW=Wp/2-P-24,L=P,Rx=Wp/2+24,RH=54,top=300,max=6;
  const head=(t,x)=>{c.fillStyle='#dcb67e';c.font='700 24px '+F;c.fillText(t.toUpperCase(),x,258)};
  head('Termine',L);head('Aufgaben'+(D.b.total?' · '+D.b.done+' von '+D.b.total+' erledigt':''),Rx);
  /* Appointments */
  const ev=D.b.events;if(!ev.length){c.fillStyle='#a8957a';c.font='italic 400 28px '+F;c.fillText('Keine Termine.',L,top)}
  ev.slice(0,max).forEach((e,i)=>{const y=top+i*RH,past=e.state==='past';c.globalAlpha=past?.45:1;
   if(e.state==='now'){c.fillStyle='rgba(233,184,114,.16)';k.rr(c,L-10,y-38,colW+20,50,12);c.fill()}
   c.fillStyle=e.state==='now'?'#ffd58a':'#fbe8c6';c.font=(e.allDay?'600 22px ':'700 29px ')+F;c.fillText(e.allDay?'ganztägig':e.time,L,y);
   const label=e.state==='now'?'jetzt':e.state==='next'?PulseRaum.inWords(e.inMin):'',lw=label?(c.font='600 22px '+F,c.measureText(label).width+14):0;
   c.fillStyle='#f6e7cf';c.font='400 29px '+F;c.fillText(fit(c,e.title,colW-122-lw),L+122,y);
   if(label){c.fillStyle=e.state==='now'?'#ffd58a':'#c9b08c';c.font='600 22px '+F;c.textAlign='right';c.fillText(label,L+colW,y);c.textAlign='left'}
   c.globalAlpha=1});
  if(ev.length>max){c.fillStyle='#a8957a';c.font='400 24px '+F;c.fillText('und '+(ev.length-max)+' weitere',L,top+max*RH-14)}
  /* Tasks: tick off */
  const ts=D.b.tasks;if(!ts.length){c.fillStyle='#a8957a';c.font='italic 400 28px '+F;c.fillText('Keine Aufgaben für heute.',Rx,top)}
  ts.slice(0,max).forEach((t,i)=>{const y=top+i*RH,hot=!t.ritual&&zone('t:'+t.id,Rx-10,y-40,colW+20,52,()=>toggle(t));
   if(hot){c.fillStyle='rgba(233,184,114,.18)';k.rr(c,Rx-10,y-40,colW+20,52,12);c.fill()}
   if(t.ritual){c.fillStyle='#c9b08c';c.font='700 28px '+F;c.fillText('✦',Rx+5,y)}
   else{c.strokeStyle=t.done?'#e9b872':'rgba(251,232,198,.75)';c.lineWidth=3;k.rr(c,Rx,y-28,32,32,8);c.stroke();if(t.done){c.fillStyle='#e9b872';k.rr(c,Rx,y-28,32,32,8);c.fill();c.strokeStyle='#2c1a10';c.lineWidth=4;c.beginPath();c.moveTo(Rx+7,y-12);c.lineTo(Rx+14,y-5);c.lineTo(Rx+26,y-21);c.stroke()}}
   const label=t.overdue?'überfällig':t.time||'',lw=label?(c.font='600 22px '+F,c.measureText(label).width+14):0;
   c.globalAlpha=t.done?.55:1;c.fillStyle='#f6e7cf';c.font='400 29px '+F;const s=fit(c,t.title,colW-52-lw);c.fillText(s,Rx+50,y);
   if(t.done){c.strokeStyle='rgba(246,231,207,.7)';c.lineWidth=2;c.beginPath();c.moveTo(Rx+50,y-9);c.lineTo(Rx+50+c.measureText(s).width,y-9);c.stroke()}
   c.globalAlpha=1;if(label){c.fillStyle=t.overdue?'#f0a08a':'#c9b08c';c.font='600 22px '+F;c.textAlign='right';c.fillText(label,Rx+colW,y);c.textAlign='left'}});
  const more=ts.length-max+D.b.moreLate;if(more>0){c.fillStyle='#a8957a';c.font='400 24px '+F;c.fillText('und '+more+' weitere in PULSE',Rx,top+max*RH-14)}
  /* Daily card and the stack lead on to their stations */
  const by=632,bh=106,bw=Wp/2-P-12;
  const hotC=zone('card',P,by,bw,bh,()=>{k.go('tarot');setTimeout(()=>k.tarotDaily(),380)});box(c,P,by,bw,bh,hotC);
  if(D.card){const face=k.cardFace(D.card.index).userData.canvas;c.drawImage(face,P+16,by+10,52,87)}else{c.fillStyle='#5a1c2c';k.rr(c,P+16,by+10,52,87,8);c.fill();c.strokeStyle='#d9b36b';c.lineWidth=2;k.rr(c,P+20,by+14,44,79,6);c.stroke()}
  c.fillStyle='#dcb67e';c.font='700 21px '+F;c.fillText('TAGESKARTE',P+88,by+36);
  c.fillStyle='#fbe8c6';c.font='700 30px '+F;c.fillText(fit(c,D.card?D.card.name:'Noch nicht gezogen',bw-110),P+88,by+70);
  c.fillStyle='#c9b08c';c.font='400 23px '+F;c.fillText(fit(c,D.card?D.card.keys:'Ziehen in der Tarotecke ›',bw-110),P+88,by+97);
  const x2=Wp/2+12,hotD=zone('deck',x2,by,bw,bh,()=>k.go('stapel'));box(c,x2,by,bw,bh,hotD);
  c.fillStyle='#dcb67e';c.font='700 21px '+F;c.fillText('DEIN STAPEL',x2+24,by+36);
  c.fillStyle='#fbe8c6';c.font='700 30px '+F;c.fillText(D.deck.done?'Für heute durch':D.deck.pos?'Weiter bei Karte '+(D.deck.pos+1)+' von '+D.deck.n:'Neu · '+D.deck.n+' Karten',x2+24,by+70);
  const n=Math.max(1,D.deck.n),gap=6,dw=Math.min(26,(bw-48-gap*(n-1))/n);for(let i=0;i<n;i++){c.fillStyle=i<D.deck.pos||D.deck.done?'#e9b872':'rgba(251,232,198,.22)';k.rr(c,x2+24+i*(dw+gap),by+84,dw,10,4);c.fill()}
 }
 function toggle(t){if(!PulseLife.get(db,t.id))return k.say('Diese Aufgabe gibt es nicht mehr.');lifeToggle(t.id)}
 board.userData.paintFn=paint;
 function refresh(force){const d=collect(),s=JSON.stringify(d);if(!force&&s===stamp)return;stamp=s;data=d;board.userData.redraw()}
 refresh(true);
 return {anchor:board,stand:1.15,width:1.45,refresh:()=>refresh(false),update(dt,t,now){if(now-tick>15000){tick=now;refresh(false)}},enter:()=>refresh(false)};
}});
