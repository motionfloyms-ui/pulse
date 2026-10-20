// SOURCE: ui/cosmos.js
/* Kalender: appointments (month, week, list) and a daily almanac in the style of the Chinese
   almanac – moon, moon sign, planetary day and hours, lunar mansion, tarot, festivals of many
   traditions, practice for the moon phase. All dates in local time. */
let cosmosDay=null,cosmosMode='month',cosmosListDays=60;
const cosmosYears={};
const COSMOS_LIB={'Chinesisches Neujahr':'sinn-neujahr-nach-dem-mondkalender',Laternenfest:'sinn-laternenfest',Mondfest:'sinn-mondfest',Geisterfest:'sinn-geisterfest',Samhain:'sinn-samhain',Yule:'sinn-yule',Imbolc:'sinn-imbolc',Ostara:'sinn-ostara',Beltane:'sinn-beltane',Litha:'sinn-litha',Lughnasadh:'sinn-lughnasadh',Mabon:'sinn-mabon',Walpurgisnacht:'sinn-walpurgisnacht',Johannisnacht:'sinn-johannisnacht','Día de los Muertos':'sinn-allerseelen-und-di-a-de-los-muertos',Allerseelen:'sinn-allerseelen-und-di-a-de-los-muertos','Beginn der Rauhnächte':'sinn-rauhna-chte','Ende der Rauhnächte':'sinn-rauhna-chte','Blauer Mond':'sinn-blauer-mond-und-schwarzer-mond','Schwarzer Mond':'sinn-blauer-mond-und-schwarzer-mond'};
const FEST_KIND={china:'Chinesisch',wheel:'Jahreskreis',europa:'Europäischer Brauch',welt:'Weltweit',moon:'Mond'};
const cosmosLocal=ms=>PulseContext.localDay(new Date(ms));
const cosmosTime=ms=>new Date(ms).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
const cosmosDays=(a,b)=>Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/864e5);
const cosmosNoon=d=>new Date(d+'T12:00:00').getTime();
function cosmosYear(y){
 if(cosmosYears[y])return cosmosYears[y];
 const from=new Date(y,0,1).getTime()-45*864e5,to=new Date(y+1,0,1).getTime()+45*864e5;
 const moons=PulseCosmos.moonEvents(from,to).map(e=>({...e,day:cosmosLocal(e.ms)}));
 const terms=[y-1,y,y+1].flatMap(x=>PulseCosmos.solarTerms(x)).map(t=>({...t,day:cosmosLocal(t.ms)}));
 const special=PulseAstro.monthlyMoons(moons,cosmosLocal);
 const fests=[...PulseCosmos.festivals(y).map(f=>f.ms?{...f,date:cosmosLocal(f.ms)}:f),...PulseAstro.extraFestivals(y),
  ...Object.entries(special).filter(([d])=>d.startsWith(String(y))).map(([date,k])=>k==='blue'?{date,name:'Blauer Mond',info:'Der zweite Vollmond in diesem Monat.',kind:'moon'}:{date,name:'Schwarzer Mond',info:'Der zweite Neumond in diesem Monat.',kind:'moon'})].sort((a,b)=>a.date.localeCompare(b.date));
 return cosmosYears[y]={moons,terms,fests};
}
function cosmosFraction(ms,moons){const news=moons.filter(e=>e.type==='new'),prev=news.findLast(e=>e.ms<=ms),next=news.find(e=>e.ms>ms);return prev&&next?(ms-prev.ms)/(next.ms-prev.ms):0}
/* Moon for a local day. Neumond, Vollmond and the quarters are named only on the day they happen. */
function cosmosMoon(date){
 const Y=cosmosYear(Number(date.slice(0,4))),start=new Date(date+'T00:00:00').getTime(),end=start+864e5,noon=start+432e5;
 const f=cosmosFraction(noon,Y.moons),f0=cosmosFraction(start,Y.moons),f1=cosmosFraction(end,Y.moons);
 const event=Y.moons.find(e=>e.day===date);let index;
 if(event)index=event.type==='new'?0:4;else if(f0<.25&&f1>=.25)index=2;else if(f0<.75&&f1>=.75)index=6;
 else{index=Math.floor(f*8+.5)%8;if(index===0)index=f>.5?7:1;else if(index===4)index=f<.5?3:5;else if(index===2)index=f<.25?1:3;else if(index===6)index=f<.75?5:7}
 const nextOf=type=>Y.moons.find(e=>e.type===type&&e.day>date)||cosmosYear(Number(date.slice(0,4))+1).moons.find(e=>e.type===type&&e.day>date);
 const prevNew=Y.moons.filter(e=>e.type==='new'&&e.day<=date).at(-1);
 const nf=nextOf('full'),nn=nextOf('new'),[name,impulse]=PulseLibrary.MOON_PHASES[index];
 return {index,name,impulse,event,age:f*29.530588853,illumination:Math.round((1-Math.cos(2*Math.PI*f))/2*100),waxing:f<.5,lunarDay:prevNew?cosmosDays(prevNew.day,date)+1:0,
  daysToFull:nf?cosmosDays(date,nf.day):0,daysToNew:nn?cosmosDays(date,nn.day):0,nextFull:nf,nextNew:nn};
}
function cosmosTerm(date){const T=cosmosYear(Number(date.slice(0,4))).terms,current=T.findLast(t=>t.day<=date),next=T.find(t=>t.day>date);return {current,next,today:current&&current.day===date}}
const cosmosFests=date=>cosmosYear(Number(date.slice(0,4))).fests.filter(f=>f.date===date);
function lifeOpenCalendar(date){cosmosDay=PulseLife.validDate(date||'')?date:(lifeSelectedDay||key());goView('calendar');renderCosmos()}
function cosmosSelect(date){cosmosDay=date;renderCosmos();document.getElementById('cosmosDetail')?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'})}
function cosmosShift(n){if(cosmosMode==='week'){cosmosDay=PulseLife.offset(cosmosDay,7*n)}else{const d=new Date(cosmosDay.slice(0,7)+'-01T12:00:00');d.setMonth(d.getMonth()+n);cosmosDay=PulseContext.localDay(d)}renderCosmos()}
function cosmosSetMode(m){cosmosMode=m;cosmosListDays=60;renderCosmos()}
function cosmosToDay(date){lifeSelectedDay=date;goView('life');renderLifeToday()}
function cosmosJump(d){cosmosDay=d;if(cosmosMode==='list')cosmosMode='month';renderCosmos();document.getElementById('cosmosDetail')?.scrollIntoView({block:'start'})}
/* ---------- Appointments ---------- */
const calItems=date=>PulseLife.day(db,date).filter(x=>x.kind!=='task'||x.status!=='done');
function calEnd(x){if(!x.time)return '';const t=Date.parse('2000-01-01T'+x.time+':00Z')+(x.duration||60)*60000;return new Date(t).toISOString().slice(11,16)}
function calWhen(x){
 if(x.occ&&x.occ.days>1)return x.time&&x.occ.day===1?x.time+' Uhr':'Tag '+x.occ.day+' von '+x.occ.days;
 if(!x.time)return x.kind==='task'?'Aufgabe':'Ganztägig';
 return x.kind==='event'?x.time+'–'+calEnd(x):x.time;
}
function calRow(x,date){
 const r=PulseLife.room(x.room);
 return '<button type="button" class="cal-row" onclick="'+lifeCall('calOpen',x.id,date)+'"><span class="cal-bar '+r.color+'" aria-hidden="true"></span><span class="cal-when">'+esc(calWhen(x))+'</span><span class="cal-what"><b>'+(x.kind==='task'?'☐ ':'')+esc(x.title)+'</b>'+(x.location||x.recur?'<small>'+esc([x.location,x.recur?'↻ '+PulseRecur.describe({...x,date:x.seriesDate||x.date}):''].filter(Boolean).join(' · '))+'</small>':'')+'</span></button>';
}
function cosmosCell(d,date){
 const m=cosmosMoon(d),sign=PulseAstro.moonSign(cosmosNoon(d)),fest=cosmosFests(d),items=calItems(d);
 const glyph=m.event?(m.event.type==='new'?'<i class="cos-m new" title="Neumond"></i>':'<i class="cos-m full" title="Vollmond"></i>'):m.index===2?'<i class="cos-m first" title="Erstes Viertel"></i>':m.index===6?'<i class="cos-m last" title="Letztes Viertel"></i>':'';
 const cls=['cos-day',d.slice(0,7)!==date.slice(0,7)?'outside':'',d===key()?'today':'',fest.length?'fest':'',fest.some(f=>f.kind==='wheel')?'wheel':''].filter(Boolean).join(' ');
 const label=lifeDate(d)+', '+m.name+', Mond in '+sign.name+(fest.length?', '+fest.map(f=>f.name).join(', '):'')+(items.length?', '+items.map(x=>(x.time?x.time+' ':'')+x.title).join(', '):'');
 const chips=items.slice(0,2).map(x=>'<i class="cos-ev '+PulseLife.room(x.room).color+'">'+esc(x.title)+'</i>').join('')+(items.length>2?'<i class="cos-more">+'+(items.length-2)+'</i>':'');
 return '<button type="button" class="'+cls+'" aria-label="'+esc(label)+'" aria-pressed="'+(d===date)+'" onclick="'+lifeCall('cosmosSelect',d)+'"><span class="cos-top"><b>'+Number(d.slice(8))+'</b><span class="cos-sky" aria-hidden="true">'+glyph+'<span class="cos-sign">'+sign.glyph+'</span></span></span><span class="cos-evs" aria-hidden="true">'+chips+'</span>'+(fest.length?'<span class="cos-marks" aria-hidden="true"><i class="cos-fest"></i></span>':'')+'</button>';
}
function cosmosMonth(date){
 return '<div class="cos-grid" role="group" aria-label="Monat">'+['Mo','Di','Mi','Do','Fr','Sa','So'].map(t=>'<small>'+t+'</small>').join('')+PulseCalendar.monthDays(date.slice(0,7)).map(d=>cosmosCell(d,date)).join('')+'</div>'+
  '<p class="cos-legend"><span><i class="cos-m new"></i>Neumond</span><span><i class="cos-m full"></i>Vollmond</span><span><span class="cos-sign">♓︎</span>Mondzeichen</span><span><i class="cos-fest"></i>Fest</span></p>';
}
function cosmosSkyLine(d){const m=cosmosMoon(d),s=PulseAstro.moonSign(cosmosNoon(d)),p=PulseAstro.dayRuler(d);return esc(m.name)+' · Mond in '+s.glyph+' '+esc(s.name)+' · '+PulseAstro.PLANET_GLYPH[p]+' '+esc(p)}
function cosmosWeek(date){
 const monday=PulseLife.offset(date,-((new Date(date+'T12:00:00').getDay()+6)%7));
 return '<div class="cal-week">'+Array.from({length:7},(_,i)=>{const d=PulseLife.offset(monday,i),items=calItems(d),fest=cosmosFests(d);
  return '<section class="cal-weekday'+(d===key()?' today':'')+(d===date?' selected':'')+'"><button type="button" class="cal-dayhead" onclick="'+lifeCall('cosmosSelect',d)+'"><b>'+esc(lifeDate(d,{weekday:'short',day:'numeric',month:'short'}))+'</b><small>'+cosmosSkyLine(d)+'</small></button>'+fest.map(f=>'<p class="cal-fest">'+esc(f.name)+'</p>').join('')+(items.length?items.map(x=>calRow(x,d)).join(''):'')+'</section>'}).join('')+'</div>';
}
function cosmosList(date){
 let out='',shown=0;
 for(let i=0;i<cosmosListDays;i++){const d=PulseLife.offset(date,i),items=calItems(d).filter(x=>x.kind!=='task');if(!items.length)continue;shown++;
  out+='<section class="cal-weekday'+(d===key()?' today':'')+'"><button type="button" class="cal-dayhead" onclick="'+lifeCall('cosmosJump',d)+'"><b>'+esc(lifeDate(d,{weekday:'long',day:'numeric',month:'long'}))+'</b><small>'+(d===key()?'heute':cosmosDays(key(),d)===1?'morgen':cosmosDays(key(),d)>0?'in '+cosmosDays(key(),d)+' Tagen':'')+'</small></button>'+items.map(x=>calRow(x,d)).join('')+'</section>'}
 return '<div class="cal-week">'+(shown?out:'<p class="life-none">Keine Termine in den nächsten '+cosmosListDays+' Tagen.</p>')+'</div>'+lifeButton('Weitere 60 Tage','cosmosListDays+=60;renderCosmos()','life-btn cal-more');
}
/* ---------- Almanac ---------- */
function cosmosCard(kicker,title,body,actions='',cls=''){return '<article class="cos-card '+cls+'"><span class="life-kicker">'+kicker+'</span>'+(title?'<b>'+title+'</b>':'')+body+(actions?'<div class="cos-actions">'+actions+'</div>':'')+'</article>'}
function cosmosAlmanac(date){
 const m=cosmosMoon(date),noon=cosmosNoon(date),start=new Date(date+'T00:00:00').getTime();
 const sign=PulseAstro.moonSign(noon),ingress=PulseAstro.moonIngresses(start,start+864e5),sun=PulseAstro.sunSign(noon),planet=PulseAstro.dayRuler(date),PL=PulseLore.PLANETS[planet];
 const almanac=PulseLore.almanac({phase:m.index,element:sign.element,planet}),P=PulseLore.PHASES[m.index];
 const when=m.event?(m.event.type==='new'?'Neumond':'Vollmond')+' um '+cosmosTime(m.event.ms)+' Uhr':moonLine(m);
 let out='<h3 class="cos-section">Almanach</h3>';
 out+='<div class="cos-moon-hero">'+moonSvg(m,76)+'<div><span class="life-kicker">Mondtag '+m.lunarDay+' · '+m.illumination+' % beleuchtet</span><b>'+esc(m.name)+'</b><small>'+esc(when)+'</small><small class="cos-moonsign">Mond in '+sign.glyph+' '+esc(sign.name)+' · '+esc(PulseLore.SIGN_TEXT[sign.name])+'</small>'+ingress.map(g=>'<small class="cos-moonsign">ab '+cosmosTime(g.ms)+' Uhr in '+g.glyph+' '+esc(g.to)+'</small>').join('')+'</div></div>';
 out+='<article class="cos-card cos-yiji"><div><span class="life-kicker">Gut für</span><ul>'+almanac.good.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div><div><span class="life-kicker">Eher meiden</span><ul class="avoid">'+almanac.avoid.map(t=>'<li>'+esc(t)+'</li>').join('')+'</ul></div><p class="cos-foot">Traditionelle Zuordnungen aus Mondphase, Mondzeichen ('+esc(sign.element)+') und Planetentag.</p></article>';
 for(const f of cosmosFests(date)){const lib=COSMOS_LIB[f.name];out+=cosmosCard(FEST_KIND[f.kind]||'Fest',esc(f.name),'<p>'+esc(f.info)+'</p>',lib?lifeButton('Ideen und Rituale',lifeCall('lifeOpenLib',lib),'life-textbtn'):'','fest')}
 const rn=PulseAstro.rauhnacht(date);if(rn){const R=PulseLore.RAUH[rn-1];out+=cosmosCard('Rauhnacht '+rn+' von 12','Steht für den '+esc(R.month),'<p>'+esc(R.text)+'</p><p class="cos-practice">Träume dieser Nacht notieren. Beim Ritual der 13 Wünsche heute einen Zettel verbrennen.</p>',lifeButton('Rauhnächte',lifeCall('lifeOpenLib','sinn-rauhna-chte'),'life-textbtn')+lifeButton('Die 13 Wünsche',lifeCall('lifeOpenLib','sinn-die-13-wu-nsche'),'life-textbtn'),'fest')}
 out+=cosmosCard('Praxis zur Mondphase',esc(P.title),'<p>'+esc(P.text)+'</p>',lifeButton('Anleitung',lifeCall('lifeOpenLib',P.lib),'life-textbtn')+lifeButton('Sigillen-Werkstatt',lifeCall('lifeOpenSigils'),'life-textbtn'));
 const hours=PulseAstro.planetaryHours(date),sunT=PulseAstro.sunTimes(date),now=Date.now(),cur=hours.find(h=>now>=h.start&&now<h.end);
 out+=cosmosCard('Planetentag · '+esc(PL.day),'<span class="cos-glyph">'+PulseAstro.PLANET_GLYPH[planet]+'</span> '+esc(planet),'<p>'+esc(PL.themes)+'</p><dl class="cos-facts"><dt>Farbe</dt><dd>'+esc(PL.color)+'</dd><dt>Metall</dt><dd>'+esc(PL.metal)+'</dd>'+(sunT?'<dt>Sonne</dt><dd>Aufgang '+cosmosTime(sunT.rise)+' · Untergang '+cosmosTime(sunT.set)+'</dd>':'')+(cur?'<dt>Jetzt</dt><dd><b>'+PulseAstro.PLANET_GLYPH[cur.planet]+' '+esc(cur.planet)+'stunde</b> bis '+cosmosTime(cur.end)+'</dd>':'')+'</dl>'+
  (hours.length?'<details class="cos-hours"><summary>Alle Planetenstunden</summary><ol>'+hours.map(h=>'<li class="'+(h===cur?'now':'')+(h.day?'':' night')+'"><span>'+cosmosTime(h.start)+'</span><span>'+PulseAstro.PLANET_GLYPH[h.planet]+' '+esc(h.planet)+'</span></li>').join('')+'</ol><small>Für Wuppertal berechnet. Tagstunden von Sonnenaufgang bis -untergang, Nachtstunden bis zum nächsten Aufgang.</small></details>':''),
  lifeButton('Planetentage',lifeCall('lifeOpenLib','sinn-planetentage'),'life-textbtn')+lifeButton('Planetenstunden',lifeCall('lifeOpenLib','sinn-planetenstunden'),'life-textbtn'));
 const mi=PulseAstro.mansion(noon),M=PulseLore.MANSIONS[mi-1];
 out+=cosmosCard('Mondstation '+mi+' von 28',esc(M[0])+' <small>'+esc(M[1])+'</small>','<p>'+esc(M[2])+'</p>',lifeButton('Die 28 Mondstationen',lifeCall('lifeOpenLib','sinn-die-28-mondstationen'),'life-textbtn'));
 const dc=PulseAstro.decanCard(PulseAstro.sunLongitude(noon)),T=PulseLibrary.TAROT,cards=[['Sonne · '+dc.decan+'. Dekan '+sun.name,dc.tarotIndex],['Mond in '+sign.name,PulseAstro.SIGN_MAJOR[sign.index]],['Planetentag '+planet,PulseAstro.PLANET_MAJOR[planet]]];
 out+=cosmosCard('Tarot des Himmels','','<div class="cos-tarot">'+cards.map(([l,i])=>'<button type="button" onclick="'+lifeCall('lifeTarotOpen',i)+'"><span class="life-mini-card" aria-hidden="true">'+lifeGlyph('star')+'</span><span><b>'+esc(T[i].name)+'</b><small>'+esc(l)+'</small></span></button>').join('')+'</div>',lifeButton('Tarot und Himmel',lifeCall('lifeOpenLib','sinn-tarot-und-himmel'),'life-textbtn'));
 const L=PulseCosmos.lunarDate(date),D=PulseCosmos.dayPillar(date),t=cosmosTerm(date),tree=PulseAstro.treeMonth(date),lore=t.current&&PulseLore.TERMS[t.current.pinyin];
 out+='<details class="cos-card cos-more-cal"><summary><span class="life-kicker">Weitere Kalender</span><b>Baumkalender, chinesischer Kalender, Jahresabschnitt</b></summary>'+
  '<dl class="cos-facts"><dt>Sonne</dt><dd>'+sun.glyph+' '+esc(sun.name)+' '+sun.degree+'°</dd><dt>Baum</dt><dd>'+esc(tree.name)+'<small>'+esc(PulseLore.TREES[tree.name]||'')+' · Baumkalender nach Robert Graves</small></dd>'+
  '<dt>China</dt><dd>'+L.day+'. Tag des '+(L.leap?'Schaltmonats nach dem ':'')+L.month+'. Mondmonats<small>Jahr '+esc(L.element+'-'+L.animal)+' ('+esc(L.name)+') · Tag '+esc(D.element+'-'+D.animal)+'</small></dd>'+
  (t.current?'<dt>Abschnitt</dt><dd>'+esc(t.current.name)+' ('+esc(t.current.pinyin)+')<small>'+esc(lore?lore[0]+' '+lore[1]:'')+'</small></dd>':'')+'</dl><div class="cos-actions">'+lifeButton('Baumkalender',lifeCall('lifeOpenLib','sinn-der-keltische-baumkalender'),'life-textbtn')+lifeButton('Chinesischer Kalender',lifeCall('lifeOpenLib','sinn-der-chinesische-mondkalender'),'life-textbtn')+lifeButton('24 Abschnitte',lifeCall('lifeOpenLib','sinn-die-24-jahresabschnitte'),'life-textbtn')+'</div></details>';
 return out;
}
function cosmosDetail(date){
 const items=calItems(date);
 return '<section id="cosmosDetail" class="cos-detail"><div class="life-row"><h2>'+esc(lifeDate(date,{weekday:'long',day:'numeric',month:'long'}))+'</h2>'+lifeButton('Im Tag öffnen',lifeCall('cosmosToDay',date),'life-textbtn')+'</div>'+
  '<div class="cal-daylist">'+(items.length?items.map(x=>calRow(x,date)).join(''):'<p class="life-none">Keine Termine.</p>')+'<button type="button" class="cal-add" onclick="'+lifeCall('calEdit','',date)+'">'+lifeGlyph('plus')+'Termin am '+esc(lifeDate(date,{day:'numeric',month:'short'}))+'</button></div>'+
  cosmosAlmanac(date)+'</section>';
}
function cosmosUpcoming(){
 const today=key(),y=Number(today.slice(0,4)),rows=[],m=cosmosMoon(today);
 if(m.nextNew)rows.push([m.nextNew.day,'Neumond',cosmosTime(m.nextNew.ms)+' Uhr']);
 if(m.nextFull)rows.push([m.nextFull.day,'Vollmond',cosmosTime(m.nextFull.ms)+' Uhr']);
 [...cosmosYear(y).fests,...cosmosYear(y+1).fests].filter(f=>f.date>today).slice(0,5).forEach(f=>rows.push([f.date,f.name,FEST_KIND[f.kind]||'']));
 rows.sort((a,b)=>a[0].localeCompare(b[0]));
 return '<section class="cos-upcoming"><h2>Am Himmel und im Jahreskreis</h2>'+rows.map(([d,name,sub])=>'<button type="button" class="cos-row" onclick="'+lifeCall('cosmosJump',d)+'"><span class="cos-row-date">'+esc(lifeDate(d,{day:'numeric',month:'short'}))+'<small>'+(cosmosDays(today,d)===1?'morgen':'in '+cosmosDays(today,d)+' T.')+'</small></span><span><b>'+esc(name)+'</b><small>'+esc(sub)+'</small></span></button>').join('')+'</section>';
}
function renderCosmos(){
 const host=document.getElementById('cosmosContent');if(!host||document.getElementById('appMain').dataset.view!=='calendar')return;
 const date=cosmosDay||(cosmosDay=key());
 const title=cosmosMode==='week'?'Woche ab '+lifeDate(PulseLife.offset(date,-((new Date(date+'T12:00:00').getDay()+6)%7)),{day:'numeric',month:'short'}):cosmosMode==='list'?'Termine':lifeDate(date,{month:'long',year:'numeric'});
 host.innerHTML='<header class="life-pagehead cal-head"><div><span class="life-kicker">Kalender</span><h1>'+esc(title)+'</h1></div><div class="cal-head-actions">'+lifeButton(lifeGlyph('plus')+'<span>Termin</span>',lifeCall('calEdit','',date),'life-btn dark')+lifeButton('⋯','calMenu()','life-iconbtn')+'</div></header>'+
  '<div class="cos-nav">'+(cosmosMode==='list'?'<span></span>':lifeButton('‹',lifeCall('cosmosShift',-1),'life-iconbtn'))+'<div class="life-seg" role="group" aria-label="Ansicht">'+[['month','Monat'],['week','Woche'],['list','Liste']].map(([k,l])=>'<button type="button" aria-pressed="'+(cosmosMode===k)+'" onclick="'+lifeCall('cosmosSetMode',k)+'">'+l+'</button>').join('')+'</div>'+(cosmosMode==='list'?'<span></span>':lifeButton('›',lifeCall('cosmosShift',1),'life-iconbtn'))+'</div>'+
  (date!==key()?'<div class="cal-today">'+lifeButton('Heute',lifeCall('cosmosSelect',key()),'life-textbtn')+'</div>':'')+
  (cosmosMode==='week'?cosmosWeek(date):cosmosMode==='list'?cosmosList(date):cosmosMonth(date))+
  (cosmosMode==='list'?'':cosmosDetail(date)+cosmosUpcoming());
}
