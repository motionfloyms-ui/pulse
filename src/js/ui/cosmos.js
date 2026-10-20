// SOURCE: ui/cosmos.js
/* Calendar view: month grid with exact moon phases, Chinese lunar dates, solar terms, wheel of the
   year, the user's own entries and a practice for every moon phase. All dates in local time. */
let cosmosDay=null;
const cosmosYears={};
const COSMOS_LIB={'Chinesisches Neujahr':'sinn-neujahr-nach-dem-mondkalender',Laternenfest:'sinn-laternenfest',Mondfest:'sinn-mondfest',Geisterfest:'sinn-geisterfest',Samhain:'sinn-samhain',Yule:'sinn-yule',Imbolc:'sinn-imbolc',Ostara:'sinn-ostara',Beltane:'sinn-beltane',Litha:'sinn-litha',Lughnasadh:'sinn-lughnasadh',Mabon:'sinn-mabon'};
const cosmosLocal=ms=>PulseContext.localDay(new Date(ms));
const cosmosTime=ms=>new Date(ms).toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'});
const cosmosDays=(a,b)=>Math.round((Date.parse(b+'T12:00:00')-Date.parse(a+'T12:00:00'))/864e5);
function cosmosYear(y){
 if(cosmosYears[y])return cosmosYears[y];
 const from=new Date(y,0,1).getTime()-45*864e5,to=new Date(y+1,0,1).getTime()+45*864e5;
 const moons=PulseCosmos.moonEvents(from,to).map(e=>({...e,day:cosmosLocal(e.ms)}));
 const terms=[y-1,y,y+1].flatMap(x=>PulseCosmos.solarTerms(x)).map(t=>({...t,day:cosmosLocal(t.ms)}));
 const fests=PulseCosmos.festivals(y).map(f=>f.ms?{...f,date:cosmosLocal(f.ms)}:f);
 return cosmosYears[y]={moons,terms,fests};
}
/* Fraction of the lunation (0 = new, .5 = full) at an instant. */
function cosmosFraction(ms,moons){
 const news=moons.filter(e=>e.type==='new'),prev=news.findLast(e=>e.ms<=ms),next=news.find(e=>e.ms>ms);
 return prev&&next?(ms-prev.ms)/(next.ms-prev.ms):0;
}
/* Moon for a local day. Neumond, Vollmond and the quarters are named only on the day they happen. */
function cosmosMoon(date){
 const Y=cosmosYear(Number(date.slice(0,4))),start=new Date(date+'T00:00:00').getTime(),end=start+864e5,noon=start+432e5;
 const f=cosmosFraction(noon,Y.moons),f0=cosmosFraction(start,Y.moons),f1=cosmosFraction(end,Y.moons);
 const event=Y.moons.find(e=>e.day===date);
 let index;
 if(event)index=event.type==='new'?0:4;
 else if(f0<.25&&f1>=.25)index=2;
 else if(f0<.75&&f1>=.75)index=6;
 else{index=Math.floor(f*8+.5)%8;if(index===0)index=f>.5?7:1;else if(index===4)index=f<.5?3:5;else if(index===2)index=f<.25?1:3;else if(index===6)index=f<.75?5:7}
 const nextOf=type=>Y.moons.find(e=>e.type===type&&e.day>date)||cosmosYear(Number(date.slice(0,4))+1).moons.find(e=>e.type===type&&e.day>date);
 const nf=nextOf('full'),nn=nextOf('new');
 const [name,impulse]=PulseLibrary.MOON_PHASES[index];
 return {index,name,impulse,event,age:f*29.530588853,illumination:Math.round((1-Math.cos(2*Math.PI*f))/2*100),waxing:f<.5,
  daysToFull:nf?cosmosDays(date,nf.day):0,daysToNew:nn?cosmosDays(date,nn.day):0,nextFull:nf,nextNew:nn};
}
function cosmosTerm(date){
 const T=cosmosYear(Number(date.slice(0,4))).terms,current=T.findLast(t=>t.day<=date),next=T.find(t=>t.day>date);
 return {current,next,today:current&&current.day===date};
}
const cosmosFests=date=>cosmosYear(Number(date.slice(0,4))).fests.filter(f=>f.date===date);
function lifeOpenCalendar(date){cosmosDay=PulseLife.validDate(date||'')?date:(lifeSelectedDay||key());goView('calendar');renderCosmos()}
function cosmosSelect(date){cosmosDay=date;renderCosmos();document.getElementById('cosmosDetail')?.scrollIntoView({behavior:reducedMotion()?'auto':'smooth',block:'start'})}
function cosmosShift(n){const d=new Date(cosmosDay.slice(0,7)+'-01T12:00:00');d.setMonth(d.getMonth()+n);cosmosDay=PulseContext.localDay(d);renderCosmos()}
function cosmosToDay(date){lifeSelectedDay=date;goView('life');renderLifeToday()}
function cosmosCell(d,date){
 const m=cosmosMoon(d),L=PulseCosmos.lunarDate(d),t=cosmosTerm(d),fest=cosmosFests(d),items=PulseLife.day(db,d).length;
 const glyph=m.event?(m.event.type==='new'?'<i class="cos-m new" title="Neumond"></i>':'<i class="cos-m full" title="Vollmond"></i>'):m.index===2?'<i class="cos-m first" title="Erstes Viertel"></i>':m.index===6?'<i class="cos-m last" title="Letztes Viertel"></i>':'';
 const lunar=L.day===1?(L.leap?'S':'')+L.month+'. Mo':String(L.day);
 const cls=['cos-day',d.slice(0,7)!==date.slice(0,7)?'outside':'',d===key()?'today':'',fest.length?'fest':'',fest.some(f=>f.kind==='wheel')?'wheel':''].filter(Boolean).join(' ');
 const label=lifeDate(d)+', '+m.name+(fest.length?', '+fest.map(f=>f.name).join(', '):'')+(t.today?', '+t.current.name:'')+(items?', '+items+(items===1?' Eintrag':' Einträge'):'');
 return '<button type="button" class="'+cls+'" aria-label="'+esc(label)+'" aria-pressed="'+(d===date)+'" onclick="'+lifeCall('cosmosSelect',d)+'"><b>'+Number(d.slice(8))+'</b><span class="cos-lunar'+(L.day===1?' start':'')+'">'+lunar+'</span><span class="cos-marks">'+glyph+(t.today?'<i class="cos-term" title="'+esc(t.current.name)+'"></i>':'')+(fest.length?'<i class="cos-fest"></i>':'')+(items?'<i class="cos-item"></i>':'')+'</span></button>';
}
function cosmosCard(kicker,title,body,actions=''){return '<article class="cos-card"><span class="life-kicker">'+kicker+'</span><b>'+title+'</b>'+body+(actions?'<div class="cos-actions">'+actions+'</div>':'')+'</article>'}
function cosmosUpcoming(){
 const today=key(),y=Number(today.slice(0,4)),rows=[];
 const m=cosmosMoon(today);
 if(m.nextNew)rows.push([m.nextNew.day,'Neumond',cosmosTime(m.nextNew.ms)+' Uhr']);
 if(m.nextFull)rows.push([m.nextFull.day,'Vollmond',cosmosTime(m.nextFull.ms)+' Uhr']);
 const t=cosmosTerm(today).next;if(t)rows.push([t.day,t.name,t.pinyin]);
 [...cosmosYear(y).fests,...cosmosYear(y+1).fests].filter(f=>f.date>today).slice(0,3).forEach(f=>rows.push([f.date,f.name,f.kind==='wheel'?'Jahreskreis':'Chinesisch']));
 rows.sort((a,b)=>a[0].localeCompare(b[0]));
 return '<section class="cos-upcoming"><h2>Demnächst</h2>'+rows.map(([d,name,sub])=>'<button type="button" class="cos-row" onclick="'+lifeCall('cosmosJump',d)+'"><span class="cos-row-date">'+esc(lifeDate(d,{day:'numeric',month:'short'}))+'<small>'+(cosmosDays(today,d)===1?'morgen':'in '+cosmosDays(today,d)+' T.')+'</small></span><span><b>'+esc(name)+'</b><small>'+esc(sub)+'</small></span></button>').join('')+'</section>';
}
function cosmosJump(d){cosmosDay=d;renderCosmos();document.getElementById('cosmosDetail')?.scrollIntoView({block:'start'})}
function cosmosDetail(date){
 const m=cosmosMoon(date),P=PulseLore.PHASES[m.index],L=PulseCosmos.lunarDate(date),D=PulseCosmos.dayPillar(date),t=cosmosTerm(date),fests=cosmosFests(date),items=PulseLife.day(db,date);
 const when=m.event?(m.event.type==='new'?'Neumond':'Vollmond')+' um '+cosmosTime(m.event.ms)+' Uhr':moonLine(m);
 let out='<section id="cosmosDetail" class="cos-detail"><h2>'+esc(lifeDate(date,{weekday:'long',day:'numeric',month:'long'}))+'</h2>';
 out+='<div class="cos-moon-hero">'+moonSvg(m,76)+'<div><span class="life-kicker">Mond · '+m.illumination+' % beleuchtet</span><b>'+esc(m.name)+'</b><small>'+esc(when)+'</small></div></div>';
 for(const f of fests){const lib=COSMOS_LIB[f.name];out+=cosmosCard(f.kind==='wheel'?'Jahreskreis':'Chinesisches Fest',esc(f.name),'<p>'+esc(f.info)+'</p>',lib?lifeButton('Ritual-Ideen',lifeCall('lifeOpenLib',lib),'life-textbtn'):'')}
 out+=cosmosCard('Praxis zur Mondphase',esc(P.title),'<p>'+esc(P.text)+'</p>',lifeButton('Anleitung',lifeCall('lifeOpenLib',P.lib),'life-textbtn'));
 const lore=t.current&&PulseLore.TERMS[t.current.pinyin];
 if(t.current)out+=cosmosCard('Jahresabschnitt · '+(t.today?'beginnt heute, '+cosmosTime(t.current.ms)+' Uhr':'seit '+esc(lifeDate(t.current.day,{day:'numeric',month:'short'}))),esc(t.current.name)+' <small>'+esc(t.current.pinyin)+'</small>',(lore?'<p>'+esc(lore[0])+'</p><p class="cos-practice"><b>Praxis:</b> '+esc(lore[1])+'</p>':'')+(t.next?'<small>Nächster: '+esc(t.next.name)+' am '+esc(lifeDate(t.next.day,{day:'numeric',month:'long'}))+'</small>':''),lifeButton('Die 24 Abschnitte',lifeCall('lifeOpenLib','sinn-die-24-jahresabschnitte'),'life-textbtn'));
 out+=cosmosCard('Chinesischer Mondkalender',L.day+'. Tag des '+(L.leap?'Schaltmonats nach dem ':'')+L.month+'. Monats',
  '<dl class="cos-facts"><dt>Jahr</dt><dd>'+esc(L.element+'-'+L.animal)+' · '+esc(L.name)+'<small>'+esc(PulseLore.ANIMALS[L.animal]||'')+'</small></dd><dt>Tag</dt><dd>'+esc(D.element+'-'+D.animal)+' · '+esc(D.name)+'<small>'+esc(PulseLore.ELEMENTS[D.element]||'')+'</small></dd></dl>',
  lifeButton('So funktioniert er',lifeCall('lifeOpenLib','sinn-der-chinesische-mondkalender'),'life-textbtn')+lifeButton('Die zwölf Tiere',lifeCall('lifeOpenLib','sinn-die-zwo-lf-tiere'),'life-textbtn'));
 out+='<div class="cos-items"><div class="life-row"><h3>Deine Einträge</h3>'+lifeButton('Im Tag öffnen',lifeCall('cosmosToDay',date),'life-textbtn')+'</div>'+(items.length?items.map(x=>lifeCard(x,{compact:true})).join(''):'<p class="life-muted">Nichts eingetragen.</p>')+'</div>';
 return out+'</section>';
}
function renderCosmos(){
 const host=document.getElementById('cosmosContent');if(!host||document.getElementById('appMain').dataset.view!=='calendar')return;
 const date=cosmosDay||(cosmosDay=key());
 host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Kalender</span><h1>'+esc(lifeDate(date,{month:'long',year:'numeric'}))+'</h1></header>'+
  '<div class="cos-nav">'+lifeButton('‹',lifeCall('cosmosShift',-1),'life-iconbtn')+(date.slice(0,7)!==key().slice(0,7)||date!==key()?lifeButton('Heute',lifeCall('cosmosSelect',key()),'life-textbtn'):'<span></span>')+lifeButton('›',lifeCall('cosmosShift',1),'life-iconbtn')+'</div>'+
  '<div class="cos-grid" role="group" aria-label="Monat">'+['Mo','Di','Mi','Do','Fr','Sa','So'].map(t=>'<small>'+t+'</small>').join('')+PulseCalendar.monthDays(date.slice(0,7)).map(d=>cosmosCell(d,date)).join('')+'</div>'+
  '<p class="cos-legend"><span><i class="cos-m new"></i>Neumond</span><span><i class="cos-m full"></i>Vollmond</span><span><i class="cos-term"></i>Jahresabschnitt</span><span><i class="cos-fest"></i>Fest</span><span><i class="cos-item"></i>Eintrag</span><span><span class="cos-lunar">9</span>Mondtag</span></p>'+
  cosmosDetail(date)+cosmosUpcoming();
}
