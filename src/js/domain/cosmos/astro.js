// SOURCE: domain/cosmos/astro.js
/* Almanac astronomy: moon longitude (Meeus ch. 47, main terms, ≈0.1°), moon and sun signs,
   sign changes, the 28 lunar mansions, sunrise/sunset, planetary days and hours, decans. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./calendar.js'):root.PulseCosmos);if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseAstro=api})(globalThis,function(Cosmos){
 'use strict';
 const RAD=Math.PI/180,sin=d=>Math.sin(d*RAD),cos=d=>Math.cos(d*RAD),norm=d=>((d%360)+360)%360;
 const jd=ms=>ms/86400000+2440587.5;
 // [D, M, M', F, coefficient in 1e-6 degrees]
 const TERMS=[[0,0,1,0,6288774],[2,0,-1,0,1274027],[2,0,0,0,658314],[0,0,2,0,213618],[0,1,0,0,-185116],[0,0,0,2,-114332],[2,0,-2,0,58793],[2,-1,-1,0,57066],[2,0,1,0,53322],[2,-1,0,0,45758],[0,1,-1,0,-40923],[1,0,0,0,-34720],[0,1,1,0,-30383],[2,0,0,-2,15327],[0,0,1,2,-12528],[0,0,1,-2,10980],[4,0,-1,0,10675],[0,0,3,0,10034],[4,0,-2,0,8548],[2,1,-1,0,-7888],[2,1,0,0,-6766],[1,0,-1,0,-5163],[1,1,0,0,4987],[2,-1,1,0,4036],[2,0,2,0,3994],[4,0,0,0,3861],[2,0,-3,0,3665],[0,1,-2,0,-2689],[2,0,-1,2,-2602],[2,-1,-2,0,2390],[1,0,1,0,-2348],[2,-2,0,0,2236],[0,1,2,0,-2120],[0,2,0,0,-2069]];
 /* Geocentric ecliptic longitude of the moon (degrees, tropical) at an instant. */
 function moonLongitude(ms){
  const T=(jd(ms)+69/86400-2451545)/36525;
  const L=218.3164477+481267.88123421*T-0.0015786*T*T,D=297.8501921+445267.1114034*T-0.0018819*T*T,M=357.5291092+35999.0502909*T-0.0001536*T*T,Mp=134.9633964+477198.8675055*T+0.0087414*T*T,F=93.2720950+483202.0175233*T-0.0036539*T*T;
  const E=1-0.002516*T-0.0000074*T*T;let sum=0;
  for(const [d,m,mp,f,c] of TERMS){const e=Math.abs(m)===1?E:Math.abs(m)===2?E*E:1;sum+=c*e*sin(d*D+m*M+mp*Mp+f*F)}
  const A1=119.75+131.849*T,A2=53.09+479264.29*T;sum+=3958*sin(A1)+1962*sin(L-F)+318*sin(A2);
  return norm(L+sum/1e6);
 }
 const sunLongitude=ms=>Cosmos.sunLongitude(jd(ms));
 const SIGNS=[['Widder','♈','Feuer','Mars'],['Stier','♉','Erde','Venus'],['Zwillinge','♊','Luft','Merkur'],['Krebs','♋','Wasser','Mond'],['Löwe','♌','Feuer','Sonne'],['Jungfrau','♍','Erde','Merkur'],['Waage','♎','Luft','Venus'],['Skorpion','♏','Wasser','Mars'],['Schütze','♐','Feuer','Jupiter'],['Steinbock','♑','Erde','Saturn'],['Wassermann','♒','Luft','Saturn'],['Fische','♓','Wasser','Jupiter']];
 const sign=lon=>{const i=Math.floor(norm(lon)/30),s=SIGNS[i];return {index:i,name:s[0],glyph:s[1]+'︎',element:s[2],ruler:s[3],degree:Math.floor(norm(lon)%30)}};
 const moonSign=ms=>sign(moonLongitude(ms));
 const sunSign=ms=>sign(sunLongitude(ms));
 /* Moon sign changes between two instants: [{ms, from, to}] (bisection to the minute). */
 function moonIngresses(from,to){
  const out=[];let t=from,cur=moonSign(t).index;
  for(let s=from+3600000;s<=to;s+=3600000){const i=moonSign(Math.min(s,to)).index;if(i!==cur){let a=t,b=Math.min(s,to);while(b-a>30000){const m=(a+b)/2;if(moonSign(m).index===cur)a=m;else b=m}out.push({ms:b,from:SIGNS[cur][0],to:SIGNS[i][0],glyph:SIGNS[i][1]+'︎'});cur=i}t=s}
  return out;
 }
 /* 28 mansions of 12°51′ from 0° Aries (tropical, as in Agrippa). */
 const mansion=ms=>Math.floor(moonLongitude(ms)/(360/28))+1;
 /* Golden Dawn decan of the sun → minor arcana card: suit index (0 Stäbe,1 Kelche,2 Schwerter,3 Pentakel) and number 2–10. */
 const DECAN_SUITS=[0,3,2,1];
 function decanCard(lon){const d=Math.floor(norm(lon)/10),signI=Math.floor(d/3),num=2+(signI%3)*3+d%3,suit=DECAN_SUITS[signI%4];return {decan:d%3+1,suit,number:num,tarotIndex:22+suit*14+(num-1)}}
 /* Major arcana for signs and planets (Golden Dawn). */
 const SIGN_MAJOR=[4,5,6,7,8,9,11,13,14,15,17,18];
 const PLANET_MAJOR={Sonne:19,Mond:2,Merkur:1,Venus:3,Mars:16,Jupiter:10,Saturn:21};
 /* Sunrise and sunset (ms) for a local date at latitude/longitude (east positive). Sunrise equation, ±2 min. */
 function sunTimes(date,lat=51.2562,lon=7.1508){
  const noonUtc=Date.parse(date+'T12:00:00Z'),n=Math.round(jd(noonUtc)-2451545+0.0008);
  const Js=n-lon/360,M=norm(357.5291+0.98560028*Js),C=1.9148*sin(M)+0.02*sin(2*M)+0.0003*sin(3*M),l=norm(M+C+180+102.9372);
  const Jt=2451545+Js+0.0053*sin(M)-0.0069*sin(2*l),dec=Math.asin(sin(l)*sin(23.4397))/RAD;
  const cw=(sin(-0.833)-sin(lat)*sin(dec))/(cos(lat)*cos(dec));if(cw<-1||cw>1)return null;
  const w=Math.acos(cw)/RAD,toMs=j=>(j-2440587.5)*86400000;
  return {rise:toMs(Jt-w/360),set:toMs(Jt+w/360),noon:toMs(Jt)};
 }
 const CHALDEAN=['Saturn','Jupiter','Mars','Sonne','Venus','Merkur','Mond'];
 const DAY_RULER=['Sonne','Mond','Mars','Merkur','Jupiter','Venus','Saturn'];// Sunday … Saturday
 const PLANET_GLYPH={Sonne:'☉',Mond:'☽',Merkur:'☿',Venus:'♀',Mars:'♂',Jupiter:'♃',Saturn:'♄'};
 const weekday=date=>new Date(date+'T12:00:00Z').getUTCDay();
 const dayRuler=date=>DAY_RULER[weekday(date)];
 /* 24 planetary hours from sunrise of `date` to sunrise of the next day. */
 function planetaryHours(date,lat,lon){
  const a=sunTimes(date,lat,lon),next=new Date(Date.parse(date+'T12:00:00Z')+86400000).toISOString().slice(0,10),b=sunTimes(next,lat,lon);if(!a||!b)return [];
  const dayLen=(a.set-a.rise)/12,nightLen=(b.rise-a.set)/12;let p=CHALDEAN.indexOf(dayRuler(date));const out=[];
  for(let i=0;i<24;i++){const start=i<12?a.rise+i*dayLen:a.set+(i-12)*nightLen;out.push({n:i+1,day:i<12,planet:CHALDEAN[p],start,end:start+(i<12?dayLen:nightLen)});p=(p+1)%7}
  return out;
 }
 /* Celtic tree months after Robert Graves (1948) – a modern system. */
 const TREES=[['12-24','Birke'],['01-21','Eberesche'],['02-18','Esche'],['03-18','Erle'],['04-15','Weide'],['05-13','Weißdorn'],['06-10','Eiche'],['07-08','Stechpalme'],['08-05','Hasel'],['09-02','Weinrebe'],['09-30','Efeu'],['10-28','Schilfrohr'],['11-25','Holunder']];
 function treeMonth(date){const md=date.slice(5);if(md==='12-23')return {name:'Tag ohne Baum',index:-1};if(md>='12-24'||md<'01-21')return {name:TREES[0][1],index:0};let idx=1;for(let i=1;i<TREES.length;i++)if(md>=TREES[i][0])idx=i;return {name:TREES[idx][1],index:idx}}
 /* Rauhnächte: twelve nights, the first from 24 to 25 Dec, the twelfth from 4 to 5 Jan. Returns n for the evening of `date`, else 0. */
 function rauhnacht(date){const md=date.slice(5);if(md>='12-24')return Number(md.slice(3))-23;if(md<='01-04')return Number(md.slice(3))+8;return 0}
 /* Second full (blue) or new (black) moon within a calendar month, local time. */
 function monthlyMoons(events,localDay){const by={};for(const e of events){const d=localDay(e.ms),k=e.type+d.slice(0,7);(by[k]=by[k]||[]).push(d)}const out={};for(const [k,days] of Object.entries(by))if(days.length>1)out[days[1]]=k.startsWith('full')?'blue':'black';return out}
 const FIXED=[['04-30','Walpurgisnacht','Nacht der Hexen und des Übergangs in den Mai.','europa'],['06-23','Johannisnacht','Feuer zur Sommersonnenwende, Johanniskraut sammeln.','europa'],['11-01','Día de los Muertos','Mexiko: Die Toten kommen zu Besuch. Altäre, Ringelblumen, Erinnerung.','welt'],['11-02','Allerseelen','Gedenken an die Verstorbenen.','europa'],['12-24','Beginn der Rauhnächte','Zwölf Nächte zwischen den Jahren.','europa'],['01-05','Ende der Rauhnächte','Die Nacht auf den 6. Januar schließt die Zeit zwischen den Jahren ab.','europa'],['12-13','Luzia','Lichtfest im dunkelsten Teil des Jahres.','europa']];
 function extraFestivals(year){return FIXED.map(([md,name,info,kind])=>({date:year+'-'+md,name,info,kind}))}
 return {moonLongitude,sunLongitude,SIGNS,sign,moonSign,sunSign,moonIngresses,mansion,decanCard,SIGN_MAJOR,PLANET_MAJOR,sunTimes,CHALDEAN,DAY_RULER,PLANET_GLYPH,dayRuler,planetaryHours,treeMonth,rauhnacht,monthlyMoons,extraFestivals};
});
