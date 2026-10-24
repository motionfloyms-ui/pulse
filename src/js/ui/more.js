// SOURCE: ui/more.js
/* "Mehr": everything that is not a tab – one search across all of Pulse, the eight rooms,
   the tools and the personal area. Replaces the separate Räume and Sammlung tabs. */
let moreQuery='';
function lifeOpenMore(){goView('more')}
function moreBack(){return lifeButton('← Mehr','lifeOpenMore()','life-back')}
const MORE_TOOLS=[
 ['stapel','Stapel','Jeden Tag ein paar Karten statt Scrollen','lifeOpenStapel()','<rect x="6" y="4" width="12" height="16" rx="2"/><path d="M3 7v11a2 2 0 0 0 2 2M21 7v11a2 2 0 0 1-2 2"/>'],
 ['raum','Himmelsraum','Ruhiger Raum mit Tarot, Sigillen, Notizbuch · auch für die Quest','lifeOpenRaum()','<path d="M3 20h18M5 20V12a7 7 0 0 1 14 0v8"/><path d="M12 5V3M8.5 6 7.5 4.3M15.5 6l1-1.7"/><circle cx="12" cy="14" r="2"/>'],
 ['songs','Song-Werkstatt','Gesangskarte, Bühnenmodus, Takes','lifeOpenSongs()','<path d="M9 18V5l11-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="17" cy="16" r="3"/>'],
 ['sigils','Sigillen','Erschaffen, laden, vergessen','lifeOpenSigils()','<path d="M5 19 19 5M6 6c4 0 7 3 7 7M12 19h7"/><circle cx="6" cy="6" r="2"/>'],
 ['sky','Dein Himmel','Sterne, 90 Tage, Tarot-Sammlung','lifeOpenSky()','<path d="m12 3 1.8 4.6L18 9l-4.2 1.4L12 15l-1.8-4.6L6 9l4.2-1.4Z"/><path d="M19 15l.8 2 2 .8-2 .8-.8 2-.8-2-2-.8 2-.8Z"/>'],
 ['focus','Fokus-Timer','Mit Rauschen, Regen, Meer','goView(\'focus\')','<circle cx="12" cy="13.5" r="7.5"/><path d="M12 13.5V9.5M10 2.5h4"/>'],
 ['cutup','Cut-up-Maschine','Texte zerschneiden, neu mischen','lifeCutup(\'\')','<circle cx="6" cy="6" r="3"/><circle cx="6" cy="18" r="3"/><path d="M20 4 8.1 15.9M14.5 14.5 20 20M8.1 8.1 12 12"/>'],
 ['tarot','Tarot','Alle 78 Karten nachschlagen','lifeTarotBrowse(\'major\',false)','<rect x="5" y="3" width="14" height="18" rx="2"/><path d="m12 8 1.2 2.6 2.8.4-2 2 .5 2.8-2.5-1.3-2.5 1.3.5-2.8-2-2 2.8-.4Z"/>'],
 ['entries','Alle Einträge','Nach Art filtern, Archiv','lifeOpenLibrary()','<path d="M9 5h12M9 12h12M9 19h12M3 5h1M3 12h1M3 19h1"/>'],
 ['library','Bibliothek','Fertige Inhalte für jeden Raum','lifeOpenLibrary(\'lib\')','<path d="M12 5C8 2 4 3 2 4v16c4-2 8-1 10 1 2-2 6-3 10-1V4c-2-1-6-2-10 1v16"/>']
];
function moreTile([id,title,sub,call,icon]){return '<button type="button" class="more-tool" data-tool="'+id+'" onclick="'+esc(call)+'"><svg viewBox="0 0 24 24" aria-hidden="true">'+icon+'</svg><span><b>'+esc(title)+'</b><small>'+esc(sub)+'</small></span></button>'}
function renderMore(){
 const host=document.getElementById('moreContent');if(!host||document.getElementById('appMain').dataset.view!=='more')return;
 if(document.activeElement?.id==='moreSearch')return renderMoreResults();
 const all=PulseLife.list(db),count=id=>all.filter(x=>x.room===id).length;
 host.innerHTML='<header class="life-pagehead"><span class="life-kicker">Alles an einem Ort</span><h1>Mehr</h1></header>'+
  '<label class="life-search more-search">'+lifeGlyph('search')+'<input id="moreSearch" type="search" aria-label="In ganz Pulse suchen" placeholder="In ganz Pulse suchen …" value="'+esc(moreQuery)+'" oninput="moreQuery=this.value;renderMoreResults()"/></label>'+
  '<div id="moreResults"></div>'+
  '<div id="moreBody"><div class="life-sectionhead"><h2>Räume</h2></div><div class="more-rooms">'+PulseLife.ROOMS.map(r=>'<button type="button" class="more-room '+r.color+'" onclick="'+lifeCall('lifeOpenSpaces',r.id)+'">'+lifeGlyph(r.symbol)+'<b>'+esc(r.name)+'</b><small>'+(count(r.id)?count(r.id)+' eigene · ':'')+PulseLibrary.forRoom(r.id).length+' Inhalte</small></button>').join('')+'</div>'+
  '<div class="life-sectionhead"><h2>Werkzeuge</h2></div><div class="more-tools">'+MORE_TOOLS.map(moreTile).join('')+'</div>'+
  '<div class="life-sectionhead"><h2>Du</h2></div><div class="more-list">'+
   [['Ziele, Plan, Verlauf, Muster','Was PULSE über dich weiß','goView(\'mehub\')'],['Einstellungen und Backup','Name, Darstellung, Töne, Speicher','lifeSettings()'],['Kalender umziehen','Import aus Google Kalender, Export, Erinnerungen','calMenu()'],['Mit anderem Gerät abgleichen','Handy und Quest auf denselben Stand','syncOpen()']].map(([t,s,c])=>'<button type="button" class="cos-row" onclick="'+esc(c)+'"><span><b>'+esc(t)+'</b><small>'+esc(s)+'</small></span><span class="more-arrow" aria-hidden="true">↗</span></button>').join('')+'</div></div>';
 renderMoreResults();
}
/* One search over everything: entries and appointments, videos, songs, library, tarot, sigils. */
function renderMoreResults(){
 const box=document.getElementById('moreResults'),body=document.getElementById('moreBody');if(!box)return;
 const q=moreQuery.trim(),t=q.toLocaleLowerCase('de');if(body)body.hidden=!!q;
 if(!q){box.innerHTML='';return}
 const has=s=>String(s||'').toLocaleLowerCase('de').includes(t);
 const entries=PulseLife.search(db,q).slice(0,12),videos=PulseVault.query(db,{q}).slice(0,8),songs=PulseSong.ensure(db).items.filter(s=>has(s.title)||has(s.lyrics)).slice(0,6);
 const sigils=PulseSigil.ensure(db).sigils.filter(s=>!s.forgottenAt&&has(s.intent)).slice(0,6),lib=PulseLibrary.search(q).slice(0,8),tarot=PulseLibrary.searchTarot(q).slice(0,6);
 const group=(title,n,html)=>n?'<section class="more-group"><h3>'+title+' <span>'+n+'</span></h3>'+html+'</section>':'';
 const total=entries.length+videos.length+songs.length+sigils.length+lib.length+tarot.length;
 box.innerHTML=total?group('Einträge und Termine',entries.length,entries.map(x=>lifeCard(x,{compact:true})).join(''))+
  group('Videos',videos.length,'<div class="vault-grid">'+videos.map(vaultCard).join('')+'</div>')+
  group('Songs',songs.length,songs.map(s=>songCard(s)).join(''))+
  group('Sigillen',sigils.length,'<div class="sigil-grid">'+sigils.map(sigilCard).join('')+'</div>')+
  group('Bibliothek',lib.length,'<div class="life-lib-grid">'+lib.map(libCard).join('')+'</div>')+
  group('Tarot',tarot.length,tarot.map(c=>'<button type="button" class="cos-row" onclick="'+lifeCall('lifeTarotOpen',c.index)+'"><span><b>'+esc(c.name)+'</b><small>'+esc(c.keywords)+'</small></span></button>').join(''))
  :'<p class="life-none">Nichts gefunden für „'+esc(q)+'“.</p>';
}
