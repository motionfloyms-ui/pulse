// End-to-end smoke test: real browser, real bundle. Clicks through the main flows and every visible
// button of every screen, and fails on any JavaScript error. Run: node tests/e2e/smoke.mjs
// Needs the "playwright" package and a Chromium (npx playwright install chromium).
import {createRequire} from 'node:module';import zlib from 'node:zlib';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((q,r)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html');const f=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(ok=>server.listen(0,ok));const base='http://localhost:'+server.address().port+'/';
/* WebGL in headless Chromium comes from SwiftShader (needed for the Himmelsraum). */
const browser=await chromium.launch({args:['--use-angle=swiftshader','--enable-unsafe-swiftshader','--ignore-gpu-blocklist']});const errs=[];let step='';
const ctx=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin',locale:'de-DE',colorScheme:'dark',acceptDownloads:true});
const pg=await ctx.newPage();
pg.on('pageerror',e=>errs.push(step+': '+e.message));
pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|ERR_/.test(m.text()))errs.push(step+': console '+m.text())});
pg.on('dialog',d=>d.accept());
await pg.route(/ytimg|youtube|noembed/,r=>r.abort());
/* Pictures of the day: the three services answer with fixed sample data, images are a 1×1 PNG. */
const PNG=Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAwMCAO+ip1sAAAAASUVORK5CYII=','base64');
await pg.route(/api\.nasa\.gov|wikipedia\.org\/api|api\.artic\.edu|upload\.wikimedia\.org|apod\.nasa\.gov\/apod\/image|artic\.edu\/iiif/,r=>{const u=r.request().url();
 if(/upload\.wikimedia|apod\/image|iiif/.test(u))return r.fulfill({contentType:'image/png',body:PNG});
 if(/api\.nasa\.gov/.test(u))return r.fulfill({json:{date:'2026-10-21',title:'Testnebel',explanation:'A test nebula.',url:'https://apod.nasa.gov/apod/image/2610/t.png',hdurl:'https://apod.nasa.gov/apod/image/2610/t.png',media_type:'image'}});
 if(/wikipedia\.org/.test(u))return r.fulfill({json:{tfa:{title:'Testartikel',titles:{normalized:'Testartikel'},extract:'Ein Artikel zum Testen.',content_urls:{mobile:{page:'https://de.m.wikipedia.org/wiki/Testartikel'}}},image:{title:'File:Testbild.png',thumbnail:{source:'https://upload.wikimedia.org/t.png'},image:{source:'https://upload.wikimedia.org/t.png'},file_page:'https://commons.wikimedia.org/wiki/File:Testbild.png',artist:{text:'Test'},license:{type:'CC0'},description:{text:'Ein Testbild.',lang:'de'}}}});
 return r.fulfill({json:{config:{iiif_url:'https://www.artic.edu/iiif/2'},data:[{id:1,title:'Testgemälde',artist_display:'Niemand',date_display:'1900',image_id:'2d484387-2509-5e8e-2c43-22f9981972eb'}]}});});
const ev=(f,a)=>pg.evaluate(f,a),pass=[];
async function check(name,fn){step=name;await fn();pass.push(name)}
/* A small ZIP like a Google Takeout export (synthetic data). */
function crc32(b){let crc=0xFFFFFFFF;for(const x of b){let c=(crc^x)&0xFF;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;crc=(crc>>>8)^c}return (crc^0xFFFFFFFF)>>>0}
function zip(files){const parts=[],central=[];let offset=0;for(const f of files){const name=Buffer.from(f.name,'utf8'),data=Buffer.from(f.text,'utf8'),body=zlib.deflateRawSync(data),crc=crc32(data);const lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(8,8);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(name.length,26);parts.push(lh,name,body);const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(8,10);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(body.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);central.push(ch,name);offset+=30+name.length+body.length}const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);return Buffer.concat([...parts,cd,end])}
try{
 await pg.goto(base);await pg.waitForTimeout(1200);
 await check('app loads',async()=>{assert.equal(await ev(()=>typeof db),'object');assert.ok(await pg.isVisible('#lifeNav'))});
 await check('quick capture routes text',async()=>{
  for(const [t,kind] of [['Zahnarzt morgen 15 Uhr','event'],['Idee für Songtext #ideen','note'],['Altglas wegbringen morgen','task']]){
   await ev(()=>lifeQuick());await pg.fill('#quickText',t);await pg.press('#quickText','Enter');await pg.waitForTimeout(150);
   assert.equal(await ev(()=>db.life.items.at(-1).kind),kind,t)}
  await ev(()=>lifeQuick());await pg.fill('#quickText','Growl Tutorial https://youtu.be/AAAAAAAAAAA');await pg.press('#quickText','Enter');await pg.waitForTimeout(150);
  assert.equal(await ev(()=>db.videos.items.at(-1).title),'Growl Tutorial');
 });
 await check('calendar: repeating event, skip one, list',async()=>{
  await ev(()=>lifeOpenCalendar());await pg.waitForTimeout(150);await ev(()=>calEdit('',key()));
  await pg.fill('#calTitle','Bandprobe');await pg.fill('#calStart','19:00');await pg.dispatchEvent('#calStart','change');await pg.selectOption('#calRecur','weekly');await pg.click('.cal-form button[type=submit]');await pg.waitForTimeout(200);
  const id=await ev(()=>db.life.items.find(x=>x.title==='Bandprobe').id),next=await ev(()=>PulseLife.offset(key(),7));
  assert.ok(await ev(([n])=>PulseLife.day(db,n).some(x=>x.title==='Bandprobe'),[next]));
  await ev(([i,n])=>calOpen(i,n),[id,next]);await pg.click('text=Nur diesen auslassen');await pg.waitForTimeout(150);
  assert.equal(await ev(([n])=>PulseLife.day(db,n).some(x=>x.title==='Bandprobe'),[next]),false);
  await ev(()=>{cosmosSetMode('list')});assert.match(await pg.innerText('.cal-week'),/Bandprobe/);
 });
 await check('calendar: .ics import and undo',async()=>{
  await ev(()=>calMenu());await pg.setInputFiles('.cal-file input',path.join(root,'tests/fixtures/google-export.ics'));await pg.waitForTimeout(300);
  await pg.click('text=Alles importieren');await pg.waitForTimeout(300);
  const n=await ev(()=>db.life.items.filter(x=>x.ics).length);assert.equal(n,8);
  await ev(()=>undoLast());await pg.waitForTimeout(150);assert.equal(await ev(()=>db.life.items.filter(x=>x.ics).length),0);
 });
 await check('quick capture: series, clean titles, details editor keeps the rule',async()=>{
  const add=async t=>{await ev(()=>lifeQuick());await pg.fill('#quickText',t);await pg.waitForTimeout(80);const route=await pg.innerText('#quickRoute');await pg.press('#quickText','Enter');await pg.waitForTimeout(150);return {route,x:await ev(()=>db.life.items.at(-1))}};
  let {route,x}=await add('Probe jeden Dienstag 19 Uhr');
  assert.match(route,/Terminserie · Jeden Dienstag · 19:00 Uhr/);
  assert.deepEqual([x.kind,x.title,x.time,x.recur.freq,x.recur.byday],['event','Probe','19:00','weekly',[2]]);
  assert.equal(await ev(d=>PulseRecur.weekday(d),x.date),2);
  ({x}=await add('Gesang alle 2 Wochen am Donnerstag 17:30–19:00, Erinnerung 1 Stunde vorher'));
  assert.deepEqual([x.title,x.recur.interval,x.recur.byday,x.duration,x.remind],['Gesang',2,[4],90,60]);
  ({x}=await add('Zahnarzt morgen um 15 Uhr'));assert.deepEqual([x.title,x.date,x.recur],['Zahnarzt',await ev(()=>PulseLife.offset(key(),1)),null]);
  ({x}=await add('Konzert am 3. Mai 20 Uhr'));assert.deepEqual([x.kind,x.title,x.date.slice(5),x.time],['event','Konzert','05-03','20:00']);
  await ev(()=>lifeQuick());await pg.fill('#quickText','Chor alle 3 Wochen samstags 11 Uhr 5-mal');await pg.click('text=Mehr Details');await pg.waitForTimeout(150);
  assert.deepEqual(await ev(()=>[calTitle.value,calRecur.value,calUntilMode.value,calCount.value]),['Chor','custom','count','5']);
  await pg.click('.cal-form button[type=submit]');await pg.waitForTimeout(150);
  const c=await ev(()=>db.life.items.find(y=>y.title==='Chor'));assert.deepEqual([c.recur.freq,c.recur.interval,c.recur.count,c.recur.byday],['weekly',3,5,[6]]);
  await ev(id=>calEdit(id),c.id);await pg.click('.cal-form button[type=submit]');await pg.waitForTimeout(150);
  assert.deepEqual(await ev(id=>{const y=PulseLife.get(db,id);return [y.recur.interval,y.recur.count]},c.id),[3,5]);
 });
 await check('videos: duplicate detection and shelf',async()=>{
  await ev(()=>lifeOpenVideos());await pg.fill('#vaultLink','https://www.youtube.com/watch?v=AAAAAAAAAAA');await pg.click('.vault-add >> text=Hinzufügen');await pg.waitForTimeout(150);
  assert.equal(await ev(()=>db.videos.items.length),1);
  await ev(()=>vaultOpen('yt-AAAAAAAAAAA'));await pg.fill('#vaultNewShelf','Growls');await pg.click('.vault-inline >> text=Anlegen');await pg.waitForTimeout(100);
  assert.deepEqual(await ev(()=>db.videos.items[0].shelves.length),1);await ev(()=>lifeCloseSheet());
 });
 await check('sigil: create, charge, forget, back button',async()=>{
  await ev(()=>lifeOpenSigils());await pg.fill('#sigilIntent','Ich singe frei');await pg.click('text=Sigille behalten');await pg.waitForTimeout(200);
  await pg.click('#lifeSheet .life-detail-actions >> text=Laden');await pg.waitForTimeout(400);
  assert.ok(await ev(()=>!document.getElementById('sigilOverlay').hidden));
  await pg.goBack();await pg.waitForTimeout(300);
  assert.ok(await ev(()=>document.getElementById('sigilOverlay').hidden),'back closes the overlay');
  assert.equal(await ev(()=>document.getElementById('appMain').dataset.view),'sigils');
 });
 await check('song: annotate, stage mode, warm-up',async()=>{
  await ev(()=>{const x=PulseSong.create(db,{title:'Lied',lyrics:'Eins zwei / drei\nvier fünf'},new Date().toISOString());save();songTab='karte';lifeOpenSongs(x.id)});await pg.waitForTimeout(150);
  await pg.click('.song-line >> nth=0 >> .song-line-head');await pg.click('.song-tools >> text=Scream');await pg.waitForTimeout(100);
  assert.equal(await ev(()=>Object.values(db.songs.items[0].notes)[0].dyn),'scream');
  await pg.click('text=Bühnenmodus');await pg.waitForTimeout(200);await pg.goBack();await pg.waitForTimeout(200);
  assert.ok(await ev(()=>document.getElementById('songStage').hidden));
  await ev(()=>songWarmStart());for(let i=0;i<8;i++){await pg.click('#songWarm >> text=Nächster Schritt');await pg.waitForTimeout(40)}
  assert.equal(await ev(()=>db.songs.warmups.length),1);
 });
 await check('Mehr: search across everything, tools reachable',async()=>{
  await pg.click('#lifeNav >> text=Mehr');await pg.waitForTimeout(150);await pg.fill('#moreSearch','growl');await pg.waitForTimeout(150);
  const groups=await ev(()=>[...document.querySelectorAll('.more-group h3')].map(h=>h.textContent.split(' ')[0]));assert.ok(groups.includes('Videos'),groups.join());
  await pg.fill('#moreSearch','');for(const t of ['Song-Werkstatt','Sigillen','Dein Himmel','Fokus-Timer','Alle Einträge']){await ev(()=>lifeOpenMore());await pg.click('.more-tool >> text='+t);await pg.waitForTimeout(80);assert.notEqual(await ev(()=>document.getElementById('appMain').dataset.view),'more',t)}
  assert.deepEqual(await ev(()=>[...document.querySelectorAll('#lifeNav [aria-current=page]')].map(b=>b.textContent)),['Mehr']);
 });
 await check('YouTube lists from a Takeout ZIP: preview, import into shelves, undo',async()=>{
  await ev(()=>goView('videos'));await pg.waitForTimeout(150);const before=await ev(()=>db.videos.items.length);
  const ids=n=>Array.from({length:n},(_,i)=>('Q'+String(i).padStart(10,'0')).slice(0,11));
  const buf=zip([{name:'Takeout/YouTube und YouTube Music/Playlists/Gesang-Videos.csv',text:'Video-ID,Zeitstempel der Erstellung des Playlist-Videos\n'+ids(40).map((v,i)=>v+',2021-0'+(1+i%9)+'-01T10:00:00+00:00').join('\n')},{name:'Takeout/YouTube und YouTube Music/Playlists/Später ansehen-Videos.csv',text:'Video-ID,Zeitstempel\n'+ids(60).slice(30).join(',2022-01-01T00:00:00+00:00\n')+',2022-01-01T00:00:00+00:00'}]);
  await pg.setInputFiles('.vault-import input[type=file]',{name:'takeout.zip',mimeType:'application/zip',buffer:buf});await pg.waitForSelector('[data-import]');
  assert.match(await pg.innerText('#lifeDetail'),/2 Listen gefunden[\s\S]*60 verschiedene Videos/);
  await pg.click('#lifeDetail button:has-text("Importieren")');await pg.waitForTimeout(400);
  assert.equal(await ev(()=>db.videos.items.length),before+60);assert.ok(await ev(()=>db.videos.shelves.some(h=>h.name==='Später ansehen')));
  assert.equal(await ev(()=>db.videos.items.filter(x=>x.vid.startsWith('Q')).filter(x=>x.shelves.length===2).length),10);
  await ev(()=>undoLast());await pg.waitForTimeout(200);assert.equal(await ev(()=>db.videos.items.length),before);
 });
 await check('Stapel: a finite stack with an end, keep a card, settings',async()=>{
  await ev(()=>goView('life'));await pg.waitForTimeout(150);await pg.click('.tile-stapel');await pg.waitForTimeout(200);
  assert.equal(await ev(()=>document.getElementById('appMain').dataset.view),'stapel');
  const n=await ev(()=>db.deck.cards.length);assert.equal(n,12);assert.match(await pg.innerText('.stapel-count'),/Karte 1 von 12/);
  const card=await ev(()=>db.deck.cards.findIndex(c=>c.type==='card'));await ev(i=>stapelGo(i),card);await pg.waitForFunction(i=>document.querySelector('.stapel-count')?.textContent.includes('Karte '+(i+1)+' von'),card);
  await pg.click('.stapel-keep');await pg.waitForTimeout(150);assert.equal(await ev(()=>db.deck.kept.length),1);
  const web=await ev(()=>db.deck.cards.findIndex(c=>c.type==='web'));assert.ok(web>0,'a picture of the day is in the stack');
  await ev(i=>stapelGo(i),web);await pg.waitForSelector('#stapelStage .t-web');await pg.waitForFunction(()=>!/Wird geladen/.test(document.getElementById('stapelStage').innerText),null,{timeout:6000});
  assert.match(await pg.innerText('#stapelStage'),/Testnebel|Testbild|Testartikel|Testgemälde/);await pg.click('.stapel-keep');await pg.waitForTimeout(150);
  assert.ok(await ev(()=>db.deck.kept.some(k=>k.ref.startsWith('w:')&&k.data&&k.data.title)));
  for(let i=0;i<n+2;i++){if(await pg.isVisible('.stapel-nav .life-btn.dark'))await pg.click('.stapel-nav .life-btn.dark');await pg.waitForTimeout(40)}
  assert.match(await pg.innerText('#stapelStage'),/Stapel durch/);assert.equal(await ev(()=>PulseDeck.finished(db)),true);
  await pg.reload();await pg.waitForTimeout(900);await ev(()=>lifeOpenStapel());await pg.waitForTimeout(150);assert.match(await pg.innerText('#stapelStage'),/Stapel durch/,'stays done after reload');
  await ev(()=>stapelSettings());await pg.click('#lifeDetail button:has-text("16")');await pg.waitForTimeout(100);assert.equal(await ev(()=>db.deck.size),16);await ev(()=>lifeCloseSheet());
  await ev(()=>stapelKept());const kl=await pg.innerText('#stapelKeptList');assert.match(kl,/#001/);assert.match(kl,/#002/);await ev(()=>lifeCloseSheet());
 });
 await check('Körper: hub, water, routes and back',async()=>{
  await pg.click('#lifeNav >> text=Körper');await pg.waitForTimeout(150);
  assert.equal(await ev(()=>document.getElementById('appMain').dataset.view),'bodyhub');
  const w=await ev(()=>today().water||0);await pg.click('.body-quick >> text=Wasser');await pg.waitForTimeout(150);
  assert.equal(await ev(()=>today().water),w+.25);
  const want=String(w+.25).replace('.',',');await pg.waitForFunction(s=>(document.querySelector('#bodyHubContent .tile-body .pulse-ring:nth-child(2)')?.getAttribute('aria-label')||'').includes(s),want,{timeout:5000}).catch(()=>{});
  assert.match(await pg.getAttribute('#bodyHubContent .tile-body .pulse-ring:nth-child(2)','aria-label'),new RegExp(want));
  for(const [t,v] of [['Essen & Trinken','nutrition'],['Training','workout'],['Befinden & Zyklus','recovery'],['Fortschritt','trends']]){
   await ev(()=>goView('bodyhub'));await pg.click('.body-routes >> text="'+t+'"');await pg.waitForTimeout(100);
   assert.equal(await ev(()=>document.getElementById('appMain').dataset.view),v,t);
   assert.deepEqual(await ev(()=>[...document.querySelectorAll('#lifeNav [aria-current=page]')].map(b=>b.textContent)),['Körper'],t);
   await pg.click('#'+v+' .backbtn');await pg.waitForTimeout(100);
   assert.equal(await ev(()=>document.getElementById('appMain').dataset.view),'bodyhub','back from '+v);
  }
 });
 await check('Himmelsraum: 3D room, a page written with the finger, simulated VR session with the hub',async()=>{
  const xr=await ctx.newPage();xr.on('pageerror',e=>errs.push(step+': '+e.message));xr.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|ERR_/.test(m.text()))errs.push(step+': console '+m.text())});
  await xr.addInitScript(require('./xr-mock.cjs'));
  await xr.route(/^https?:\/\/(?!localhost)/,r=>r.abort());/* the stack would load pictures of the day */
  await xr.goto(base+'?action=raum');await xr.waitForFunction(()=>typeof RAUM!=='undefined'&&!!RAUM,null,{timeout:60000});
  const x=(f,a)=>xr.evaluate(f,a);
  /* Phone: write on the surface of light with the finger, keep it as a page. */
  await xr.click('#raumControls button:has-text("Schreiben")');await xr.waitForFunction(()=>RAUM.debug.bk.view==='write'&&RAUM.debug.settled(),null,{timeout:20000});await xr.waitForTimeout(900);
  const c=await x(()=>RAUM.debug.toScreen(RAUM.debug.objects.paneMesh));
  await xr.mouse.move(c.x-60,c.y);await xr.mouse.down();for(let i=0;i<=20;i++)await xr.mouse.move(c.x-60+i*6,c.y+Math.sin(i/2)*12);await xr.mouse.up();
  assert.equal(await x(()=>RAUM.debug.draft.strokes.length),1,'finger stroke');
  await x(()=>RAUM.debug.select('Fertig'));await xr.waitForFunction(()=>raumPages().length===1&&RAUM.debug.bk.view==='read',null,{timeout:20000});
  assert.deepEqual(await x(()=>{const p=raumPages()[0];return [p.room,p.photos.length,/^Notizbuch · /.test(p.title)]}),['innen',1,true]);
  /* VR, simulated: enter, two controllers, buttons by ray, writing into the air, leave. */
  await xr.click('#raumControls button:has-text("In VR betreten")');await xr.waitForFunction(()=>RAUM.debug.renderer.xr.isPresenting,null,{timeout:20000});
  await x(()=>{const m=__xr;m.L=m.controller('left');m.R=m.controller('right');m.session.setSources([m.L,m.R])});
  const frames=async n=>{const f0=await x(()=>__xr.frames);await xr.waitForFunction(([f0,n])=>__xr.frames>=f0+n,[f0,n],{timeout:30000})};
  /* Poses are given in the tracked space; after moving through the room it no longer matches the world. */
  const aim=(label,hand='R')=>x(([label,hand])=>{let o=null;RAUM.debug.scene.traverse(n=>{if(n.userData&&n.userData.label===label){let v=true,p=n;while(p){if(!p.visible)v=false;p=p.parent}if(v)o=n}});if(!o)return false;const l=RAUM.debug.camera.parent.worldToLocal(o.getWorldPosition(o.position.clone()));__xr.aim(__xr[hand].targetRaySpace,[hand==='L'?-.12:.12,1.32,-.08],[l.x,l.y,l.z]);return true},[label,hand]);
  const click=(hand='R')=>x(hand=>{const m=__xr,s=m[hand];m.session.fire('selectstart',s);m.session.fire('selectend',s);m.session.fire('select',s)},hand);
  const press=async(label,hand='R')=>{assert.ok(await aim(label,hand),'button '+label+' '+JSON.stringify(await x(()=>{const l=[];RAUM.debug.scene.traverse(n=>{if(n.userData&&n.userData.label){let v=true,p=n;while(p){if(!p.visible)v=false;p=p.parent}if(v)l.push(n.userData.label)}});return [RAUM.debug.bk.view,l.join(',')]})));await frames(3);await click(hand);await frames(2)};
  const settle=()=>xr.waitForFunction(()=>RAUM.debug.settled(),null,{timeout:10000});
  await frames(3);await press('Zuklappen');assert.equal(await x(()=>RAUM.debug.bk.view),'closed');
  await press('Notizbuch');await press('Schreiben');assert.equal(await x(()=>RAUM.debug.bk.view),'write');
  const pane=await x(()=>RAUM.debug.objects.pane.position.toArray());
  const pen=async(dx,dy)=>{await x(p=>{__xr.poses.set(__xr.R.targetRaySpace,{p,q:[0,0,0,1]})},[pane[0]+dx,pane[1]+dy,pane[2]+.19]);await frames(1)};
  await pen(-.15,0);await x(()=>__xr.session.fire('selectstart',__xr.R));for(let i=0;i<=12;i++)await pen(-.15+i*.025,Math.sin(i/2)*.03);
  await x(()=>{__xr.session.fire('selectend',__xr.R);__xr.session.fire('select',__xr.R)});await frames(2);
  assert.ok(await x(()=>RAUM.debug.draft.strokes.length===1&&RAUM.debug.draft.strokes[0].length>=15),'stroke written into the air');
  await press('Fertig');await xr.waitForFunction(()=>raumPages().length===2&&RAUM.debug.bk.view==='read'&&RAUM.debug.settled(),null,{timeout:30000});
  await press('Zuklappen');
  /* Hub: the desk takes you to the day board, a task is ticked off there, back to the middle; the menu at the hand
     leads to the stack (one card on); the bowl is struck with the tip of the controller; a fingertip presses a desk button. */
  await x(()=>{PulseLife.create(db,{kind:'task',title:'Kerze anzünden',date:key()},'hub-t1',new Date().toISOString());save()});
  await press('Tafel');await settle();await frames(2);assert.equal(await x(()=>RAUM.debug.hub.at),'tag');
  const zone=await x(()=>{const b=RAUM.debug.stations.tag.anchor,z=b.userData.zones.find(z=>z.id==='t:hub-t1'),c=b.material.map.userData.canvas,g=b.geometry.parameters;
   return RAUM.debug.camera.parent.worldToLocal(b.localToWorld(b.position.clone().set(((z.x+z.w/2)/c.width-.5)*g.width,(.5-(z.y+z.h/2)/c.height)*g.height,0))).toArray()});
  await x(l=>__xr.aim(__xr.R.targetRaySpace,[.12,1.32,-.08],l),zone);await frames(3);await click();await frames(2);
  assert.equal(await x(()=>PulseLife.get(db,'hub-t1').status),'done','task ticked off on the board');
  await press('Zur Mitte');await settle();await frames(2);
  assert.deepEqual(await x(()=>{const h=RAUM.debug.headWorld();return [RAUM.debug.hub.at,Math.round(h.x*100),Math.round(h.z*100)]}),[null,0,0]);
  await x(()=>{__xr.R.gamepad.buttons[4]={pressed:true}});await frames(2);await x(()=>{__xr.R.gamepad.buttons[4]={pressed:false}});await frames(2);
  assert.ok(await x(()=>RAUM.debug.objects.wrist.visible),'menu at the hand');
  await press('Stapel','L');await settle();await frames(3);
  assert.deepEqual(await x(()=>[RAUM.debug.hub.at,RAUM.debug.stations.stapel.debug.st.revealed]),['stapel',true]);
  const [pos0,n0]=await x(()=>{const d=PulseDeck.ensure(db);return [d.pos,d.cards.length]});
  if(pos0<n0){for(let i=0;i<6&&await x(()=>PulseDeck.ensure(db).pos)===pos0;i++)await press('Weiter ›');assert.equal(await x(()=>PulseDeck.ensure(db).pos),pos0+1,'one card on in the stack')}
  else{await press('‹ Zurück');assert.equal(await x(()=>PulseDeck.ensure(db).pos),pos0-1,'back from the end of the stack')}
  await x(()=>RAUM.debug.go('schale'));await settle();await frames(2);
  const bowl=await x(()=>{const D=RAUM.debug,b=D.stations.schale.debug.bowl,r=D.camera.parent,w=b.getWorldPosition(b.position.clone());return [r.worldToLocal(w.clone().setY(w.y+.12)).toArray(),r.worldToLocal(w.clone().setY(w.y-.03)).toArray()]});
  for(const p of bowl){await x(p=>__xr.poses.set(__xr.R.targetRaySpace,{p:[p[0],p[1],p[2]+.04],q:[0,0,0,1]}),p);await frames(3)}
  assert.ok(await x(()=>RAUM.debug.stations.schale.debug.strikes()>0),'bowl struck with the controller');
  await x(()=>RAUM.debug.home());await settle();await x(()=>{const m=__xr;m.H=m.hand('right');m.session.setSources([m.L,m.H])});await frames(3);
  const btn=await x(()=>{let o=null;RAUM.debug.scene.traverse(q=>{if(q.userData&&q.userData.label==='Nacht'&&!q.userData.wrist)o=q});return [o.getWorldPosition(o.position.clone()).toArray(),o.getWorldDirection(o.position.clone()).toArray()]});
  for(const d of [.04,.02,.008,-.006]){await x(([w,n,d])=>{const l=RAUM.debug.camera.parent.worldToLocal(RAUM.debug.camera.position.clone().set(w[0]+n[0]*d,w[1]+n[1]*d,w[2]+n[2]*d));__xr.H.center=[l.x,l.y-.04,l.z+.03]},[...btn,d]);await frames(2)}
  assert.equal(await x(()=>raumPrefs().time),'nacht','desk button pressed with a fingertip');
  await x(()=>{const m=__xr;m.session.setSources([m.L,m.R])});await frames(3);
  assert.ok(await aim('Verlassen'),'leave button');await frames(3);await click();
  await xr.waitForFunction(()=>!RAUM.debug.renderer.xr.isPresenting,null,{timeout:10000});
  await x(()=>goView('life'));await xr.waitForTimeout(200);await xr.close();
  await pg.reload();await pg.waitForTimeout(900);/* the other window saved: start from its state */
 });
 await check('Abgleich: package from one device merged into another and back',async()=>{
  await ev(()=>{const now=new Date().toISOString();PulseLife.create(db,{kind:'note',room:'sinn',title:'Vom Handy für die Quest'},'sync-a',now);PulseSigil.create(db,{intent:'Abgleich klappt'},now,'sg-sync');save()});
  await ev(()=>syncOpen());
  const [d1]=await Promise.all([pg.waitForEvent('download'),pg.click('#lifeDetail button:has-text("Paket erstellen")')]);const f1=await d1.path();
  const ctx2=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin',locale:'de-DE',acceptDownloads:true});const q=await ctx2.newPage();
  q.on('pageerror',e=>errs.push(step+' (zweites Gerät): '+e.message));
  await q.goto(base);await q.waitForTimeout(900);
  await q.evaluate(()=>{PulseLife.create(db,{kind:'note',room:'innen',title:'Seite aus der Quest',source:'raum'},'sync-b',new Date().toISOString());save()});
  await q.evaluate(()=>syncOpen());await q.setInputFiles('#lifeDetail input[type=file]',f1);await q.waitForSelector('#syncResult .sync-preview');
  assert.match(await q.innerText('#syncResult'),/Einträge[\s\S]*Sigillen/i);
  await q.click('#syncResult button:has-text("Zusammenführen")');await q.waitForSelector('#syncResult .sync-preview.done');
  assert.deepEqual(await q.evaluate(()=>[!!PulseLife.get(db,'sync-a'),!!PulseLife.get(db,'sync-b'),PulseSigil.ensure(db).sigils.some(s=>s.id==='sg-sync')]),[true,true,true]);
  const [d2]=await Promise.all([q.waitForEvent('download'),q.click('#syncResult button:has-text("Paket für das andere Gerät")')]);const f2=await d2.path();
  await ev(()=>syncOpen());await pg.setInputFiles('#lifeDetail input[type=file]',f2);await pg.waitForSelector('#syncResult .sync-preview');
  await pg.click('#syncResult button:has-text("Zusammenführen")');await pg.waitForSelector('#syncResult .sync-preview.done');
  assert.equal(await ev(()=>PulseLife.get(db,'sync-b')?.title),'Seite aus der Quest');
  await ev(()=>syncOpen());await pg.setInputFiles('#lifeDetail input[type=file]',f2);await pg.waitForSelector('#syncResult .sync-preview');
  assert.match(await pg.innerText('#syncResult'),/Nichts Neues/,'the same package twice changes nothing');
  await ev(()=>lifeCloseSheet());await ctx2.close();
 });
 await check('theme switch survives reload',async()=>{await ev(()=>lifeSetTheme('light'));await pg.reload();await pg.waitForTimeout(800);assert.equal(await ev(()=>document.documentElement.dataset.theme),'light');await ev(()=>{lifeCloseSheet();lifeSetTheme('auto')})});
 await check('daily snapshot and restore (Zeitreise)',async()=>{
  await ev(()=>backupSnapshot('day'));const before=await ev(()=>db.life.items.length);
  await ev(()=>{PulseLife.create(db,{kind:'note',title:'Wird zurückgenommen'},'zr1',new Date().toISOString());save()});
  const id=await ev(async()=>(await PulseIDB.listSnapshots()).find(s=>s.kind==='day').id);
  await Promise.all([pg.waitForNavigation(),ev(i=>backupRestore(i),id)]);await pg.waitForTimeout(1200);
  assert.equal(await ev(()=>db.life.items.length),before);assert.equal(await ev(()=>db.life.items.some(x=>x.id==='zr1')),false);
 });
 await check('every button on every screen',async()=>{
  const views=["goView('life')","lifeOpenMore()","lifeOpenSpaces('sinn')","lifeOpenSpaces('ideen')","lifeOpenLibrary()","goView('focus')","lifeOpenCalendar()","cosmosSetMode('week')","lifeOpenVideos()","lifeOpenSigils()","lifeOpenSky()","lifeOpenSongs()","lifeOpenStapel()","lifeOpenRaum()","goView('bodyhub')","goView('nutrition')","goView('mehub')"];
  const SKIP=/löschen|entfernen|export|backup|installieren|youtube|import|archiv|laden|bühnenmodus|einsingen/i;
  for(const v of views){step='crawl '+v;await ev(v);await pg.waitForTimeout(80);
   const n=await ev(()=>[...document.querySelectorAll('main .view.active button')].filter(e=>e.offsetParent).length);
   for(let i=0;i<n;i++){await ev(()=>{try{if(activeDialog)closeDialog(document.getElementById(activeDialog))}catch(_){}});await ev(v);
    const t=await ev(i=>{const e=[...document.querySelectorAll('main .view.active button')].filter(e=>e.offsetParent)[i];return e?(e.innerText+' '+(e.getAttribute('onclick')||'')):null},i);
    if(!t||SKIP.test(t))continue;step='crawl '+v+' #'+i+' '+t.slice(0,50);
    await ev(i=>{const e=[...document.querySelectorAll('main .view.active button')].filter(e=>e.offsetParent)[i];e&&e.click()},i);await pg.waitForTimeout(40)}}
 });
 await check('full localStorage: data moves to IndexedDB and survives a reload',async()=>{
  await ev(()=>{const chunk='z'.repeat(200000);try{for(let n=0;n<40;n++)localStorage.setItem('filler'+n,chunk)}catch(_){}});
  await ev(()=>{const now=new Date().toISOString();for(let i=0;i<1200;i++)db.life.items.push({id:'big'+i,kind:'note',title:'Notiz '+i,body:'Lorem ipsum '.repeat(30),room:'alltag',date:'',time:'',deadline:'',duration:25,status:'open',parent:'',source:'',steps:[],url:'',repeat:0,resume:'',photos:[],createdAt:now,updatedAt:now});save()});
  await ev(()=>storage.flush());assert.equal(await ev(()=>storage.mode),'idb');
  const n=await ev(()=>db.life.items.length);await pg.reload();await pg.waitForTimeout(1500);
  assert.equal(await ev(()=>storage.mode),'idb');assert.equal(await ev(()=>db.life.items.length),n);
 });
}catch(e){errs.push(step+': '+e.message)}
await browser.close();server.close();
console.log(pass.map(p=>'ok  '+p).join('\n'));
if(errs.length){console.error('\nFAILED in "'+step+'":\n'+[...new Set(errs)].map(e=>'  '+e).join('\n'));
 /* On GitHub the message also becomes an annotation, readable without the full log. */
 if(process.env.GITHUB_ACTIONS)for(const e of [...new Set(errs)].slice(0,8))console.log('::error title=E2E::'+String(e).slice(0,900).replace(/%/g,'%25').replace(/\r/g,'').replace(/\n/g,'%0A'));
 process.exit(1)}
console.log('\nE2E: '+pass.length+' checks passed, no JavaScript errors.');
