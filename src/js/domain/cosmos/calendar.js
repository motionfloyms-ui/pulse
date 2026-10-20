// SOURCE: domain/cosmos/calendar.js
/* Astronomy for the calendar: exact new/full moons (Meeus ch. 49), solar longitude (Meeus ch. 25,
   low precision), the 24 solar terms, the Chinese lunisolar calendar (Beijing time) and the
   wheel of the year. Accuracy: a few minutes, enough for calendar days. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseCosmos=api})(globalThis,function(){
 'use strict';
 const RAD=Math.PI/180,sin=d=>Math.sin(d*RAD),norm=d=>((d%360)+360)%360;
 const jdFromMs=ms=>ms/86400000+2440587.5,msFromJd=jd=>(jd-2440587.5)*86400000;
 const DELTA_T=69/86400; // TT − UT, seconds → days (2020s)
 /* Apparent solar longitude in degrees for a Julian day (UT). */
 function sunLongitude(jd){
  const T=(jd+DELTA_T-2451545)/36525,L0=280.46646+36000.76983*T+0.0003032*T*T,M=357.52911+35999.05029*T-0.0001537*T*T;
  const C=(1.914602-0.004817*T-0.000014*T*T)*sin(M)+(0.019993-0.000101*T)*sin(2*M)+0.000289*sin(3*M);
  const omega=125.04-1934.136*T;return norm(L0+C-0.00569-0.00478*sin(omega));
 }
 /* Moment (ms, UTC) when the sun reaches longitude `deg`, searched near `guessMs`. */
 function sunAt(deg,guessMs){
  let jd=jdFromMs(guessMs);
  for(let i=0;i<50;i++){const diff=((deg-sunLongitude(jd)+540)%360)-180;jd+=diff/0.98565;if(Math.abs(diff)<1e-6)break}
  return msFromJd(jd);
 }
 /* New moon (phase 0) or full moon (phase 0.5) for lunation k. Returns ms UTC. */
 function moonPhase(k,phase){
  k=Math.floor(k)+phase;const T=k/1236.85,T2=T*T,T3=T2*T,T4=T3*T;
  let jde=2451550.09766+29.530588861*k+0.00015437*T2-0.00000015*T3+0.00000000073*T4;
  const E=1-0.002516*T-0.0000074*T2,M=2.5534+29.1053567*k-0.0000014*T2-0.00000011*T3,
   Mp=201.5643+385.81693528*k+0.0107582*T2+0.00001238*T3-0.000000058*T4,
   F=160.7108+390.67050284*k-0.0016118*T2-0.00000227*T3+0.000000011*T4,
   O=124.7746-1.56375588*k+0.0020672*T2+0.00000215*T3;
  const c=phase===0?[-0.4072,0.17241,0.01608,0.01039,0.00739,-0.00514,0.00208]:[-0.40614,0.17302,0.01614,0.01043,0.00734,-0.00515,0.00209];
  jde+=c[0]*sin(Mp)+c[1]*E*sin(M)+c[2]*sin(2*Mp)+c[3]*sin(2*F)+c[4]*E*sin(Mp-M)+c[5]*E*sin(Mp+M)+c[6]*E*E*sin(2*M)
   -0.00111*sin(Mp-2*F)-0.00057*sin(Mp+2*F)+0.00056*E*sin(2*Mp+M)-0.00042*sin(3*Mp)+0.00042*E*sin(M+2*F)+0.00038*E*sin(M-2*F)
   -0.00024*E*sin(2*Mp-M)-0.00017*sin(O)-0.00007*sin(Mp+2*M)+0.00004*sin(2*Mp-2*F)+0.00004*sin(3*M)+0.00003*sin(Mp+M-2*F)
   +0.00003*sin(2*Mp+2*F)-0.00003*sin(Mp+M+2*F)+0.00003*sin(Mp-M+2*F)-0.00002*sin(Mp-M-2*F)-0.00002*sin(3*Mp+M)+0.00002*sin(4*Mp);
  return msFromJd(jde-DELTA_T);
 }
 const lunationNear=ms=>Math.round((jdFromMs(ms)-2451550.09766)/29.530588861);
 /* All new and full moons between two instants (ms), sorted. */
 function moonEvents(fromMs,toMs){
  const out=[];for(let k=lunationNear(fromMs)-1;k<=lunationNear(toMs)+1;k++)for(const [p,type] of [[0,'new'],[.5,'full']]){const t=moonPhase(k,p);if(t>=fromMs&&t<toMs)out.push({type,ms:t})}
  return out.sort((a,b)=>a.ms-b.ms);
 }
 /* Calendar date (YYYY-MM-DD) of an instant in a fixed UTC offset in hours. */
 function dateIn(ms,offsetH){return new Date(ms+offsetH*3600000).toISOString().slice(0,10)}
 const dayMs=d=>Date.parse(d+'T00:00:00Z');
 const addDays=(d,n)=>new Date(dayMs(d)+n*86400000).toISOString().slice(0,10);

 const TERMS=[
  ['Lichun','Frühlingsanfang',315],['Yushui','Regenwasser',330],['Jingzhe','Erwachen der Insekten',345],['Chunfen','Frühlings-Tagundnachtgleiche',0],
  ['Qingming','Klares Licht',15],['Guyu','Kornregen',30],['Lixia','Sommeranfang',45],['Xiaoman','Kleine Fülle',60],['Mangzhong','Korn mit Grannen',75],
  ['Xiazhi','Sommersonnenwende',90],['Xiaoshu','Kleine Hitze',105],['Dashu','Große Hitze',120],['Liqiu','Herbstanfang',135],['Chushu','Ende der Hitze',150],
  ['Bailu','Weißer Tau',165],['Qiufen','Herbst-Tagundnachtgleiche',180],['Hanlu','Kalter Tau',195],['Shuangjiang','Reif fällt',210],['Lidong','Winteranfang',225],
  ['Xiaoxue','Kleiner Schnee',240],['Daxue','Großer Schnee',255],['Dongzhi','Wintersonnenwende',270],['Xiaohan','Kleine Kälte',285],['Dahan','Große Kälte',300]];
 /* Solar terms of a Gregorian year with exact instants. Major terms (zhongqi) are multiples of 30°. */
 function solarTerms(year){
  return TERMS.map(([pinyin,name,deg])=>{const month=((Math.round(deg/30)+2)%12)+1,guess=Date.UTC(year,month-1,deg%30===0?21:6);return {pinyin,name,deg,major:deg%30===0,ms:sunAt(deg,guess)}}).sort((a,b)=>a.ms-b.ms);
 }
 const BJ=8;
 /* Chinese months of the "sui" ending at the winter solstice of `year`: from month 11 (around Dec of year−1)
    up to, but excluding, the next month 11. Leap month = first month without a major term in a 13-month sui. */
 const suiCache=new Map();
 function sui(year){
  if(suiCache.has(year))return suiCache.get(year);
  const ws1=dateIn(sunAt(270,Date.UTC(year-1,11,21)),BJ),ws2=dateIn(sunAt(270,Date.UTC(year,11,21)),BJ);
  const starts=[];let k=lunationNear(Date.UTC(year-1,11,1))-2;
  while(starts.length<20){const d=dateIn(moonPhase(k,0),BJ);starts.push(d);k++}
  const i0=starts.findLastIndex(d=>d<=ws1),i1=starts.findLastIndex(d=>d<=ws2);
  const list=starts.slice(i0,i1+1);// last element = next month 11
  const majors=[];for(const y of [year-1,year,year+1])for(const t of solarTerms(y))if(t.major)majors.push(dateIn(t.ms,BJ));
  const hasMajor=(a,b)=>majors.some(d=>d>=a&&d<b);
  const leapYear=list.length-1===13;let leapUsed=false,num=11;const months=[];
  for(let i=0;i<list.length-1;i++){
   let leap=false;
   if(leapYear&&!leapUsed&&i>0&&!hasMajor(list[i],list[i+1])){leap=true;leapUsed=true}
   else if(i>0)num=num%12+1;
   months.push({start:list[i],end:list[i+1],num,leap});
  }
  const out={months,nextStart:list.at(-1)};suiCache.set(year,out);return out;
 }
 const STEMS=[['Jia','Holz','Yang'],['Yi','Holz','Yin'],['Bing','Feuer','Yang'],['Ding','Feuer','Yin'],['Wu','Erde','Yang'],['Ji','Erde','Yin'],['Geng','Metall','Yang'],['Xin','Metall','Yin'],['Ren','Wasser','Yang'],['Gui','Wasser','Yin']];
 const BRANCHES=[['Zi','Ratte'],['Chou','Büffel'],['Yin','Tiger'],['Mao','Hase'],['Chen','Drache'],['Si','Schlange'],['Wu','Pferd'],['Wei','Ziege'],['Shen','Affe'],['You','Hahn'],['Xu','Hund'],['Hai','Schwein']];
 function cyclicalYear(cy){const s=STEMS[((cy-4)%10+10)%10],b=BRANCHES[((cy-4)%12+12)%12];return {stem:s[0],element:s[1],polarity:s[2],branch:b[0],animal:b[1],name:s[0]+'-'+b[0]}}
 /* Stem and branch of a calendar day (60-day cycle; 2000-01-01 is Wu-Wu). */
 function dayPillar(date){const jdn=Math.round(dayMs(date)/86400000+2440587.5),i=((jdn-11)%60+60)%60,s=STEMS[i%10],b=BRANCHES[i%12];return {index:i,stem:s[0],element:s[1],polarity:s[2],branch:b[0],animal:b[1],name:s[0]+'-'+b[0]}}
 /* Chinese date for a Gregorian date string (dates are taken as Beijing calendar days). */
 function lunarDate(date){
  const y=Number(date.slice(0,4));let s=sui(y);
  if(date<s.months[0].start)s=sui(y-1);else if(date>=s.nextStart)s=sui(y+1);
  const idx=s.months.findLastIndex(m=>m.start<=date),m=s.months[idx];
  const firstMonth1=s.months.findIndex(x=>x.num===1&&!x.leap);
  const suiYear=Number(s.nextStart.slice(0,4));
  const cy=idx<firstMonth1?suiYear-1:suiYear;
  return {month:m.num,leap:m.leap,day:Math.round((dayMs(date)-dayMs(m.start))/86400000)+1,monthStart:m.start,monthLength:Math.round((dayMs(m.end)-dayMs(m.start))/86400000),year:cy,...cyclicalYear(cy)};
 }
 /* Gregorian date of a Chinese month/day in Chinese year `cy`. */
 function fromLunar(cy,month,day){
  for(const y of [cy,cy+1]){const s=sui(y);const first1=s.months.findIndex(x=>x.num===1&&!x.leap);
   for(let i=0;i<s.months.length;i++){const m=s.months[i],year=i<first1?y-1:y;if(year===cy&&m.num===month&&!m.leap)return addDays(m.start,day-1)}}
  return null;
 }
 const FESTIVALS=[[1,1,'Chinesisches Neujahr','Beginn des neuen Mondjahres.'],[1,15,'Laternenfest','Erster Vollmond des Jahres.'],[5,5,'Drachenbootfest','Mitte des Sommers, Schutzbräuche.'],[7,7,'Qixi','Fest der Weberin und des Kuhhirten.'],[7,15,'Geisterfest','Der Monat der hungrigen Geister erreicht seinen Höhepunkt; Ahnen werden geehrt.'],[8,15,'Mondfest','Vollmond der Herbstmitte.'],[9,9,'Doppelneun','Berge besteigen, Ahnen gedenken.'],[12,8,'Laba','Laba-Brei, Vorbereitung auf das neue Jahr.']];
 /* Festivals and seasonal points of a Gregorian year: Chinese festivals and the wheel of the year. */
 function festivals(year){
  const out=[];
  for(const cy of [year-1,year])for(const [m,d,name,info] of FESTIVALS){const date=fromLunar(cy,m,d);if(date&&date.startsWith(String(year)))out.push({date,name,info,kind:'china'})}
  const wheel=[['Imbolc',`${year}-02-01`,'Erwachen des Lichts, Reinigung, Neubeginn.'],['Beltane',`${year}-05-01`,'Fruchtbarkeit, Lebenskraft, Feuer.'],['Lughnasadh',`${year}-08-01`,'Erste Ernte, Dank, Können.'],['Samhain',`${year}-10-31`,'Schwelle zwischen den Welten, Ahnen, Jahresende.']];
  for(const [name,date,info] of wheel)out.push({date,name,info,kind:'wheel'});
  for(const [deg,name,info] of [[0,'Ostara','Gleichgewicht von Tag und Nacht, Wachstum.'],[90,'Litha','Höchster Sonnenstand, Fülle.'],[180,'Mabon','Gleichgewicht, zweite Ernte, Dank.'],[270,'Yule','Längste Nacht, Wiederkehr des Lichts.']]){const t=solarTerms(year).find(x=>x.deg===deg);out.push({date:dateIn(t.ms,1),name,info,kind:'wheel',ms:t.ms})}
  return out.sort((a,b)=>a.date.localeCompare(b.date));
 }
 return {sunLongitude,sunAt,moonPhase,moonEvents,solarTerms,sui,lunarDate,fromLunar,festivals,cyclicalYear,dayPillar,dateIn,TERMS};
});

