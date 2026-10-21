// End-to-end smoke test: real browser, real bundle. Clicks through the main flows and every visible
// button of every screen, and fails on any JavaScript error. Run: node tests/e2e/smoke.mjs
// Needs the "playwright" package and a Chromium (npx playwright install chromium).
import {createRequire} from 'node:module';import http from 'node:http';import fs from 'node:fs';import path from 'node:path';import assert from 'node:assert/strict';
const require=createRequire(import.meta.url);const {chromium}=require(process.env.PLAYWRIGHT_PATH||'playwright');
const root=path.resolve(path.dirname(new URL(import.meta.url).pathname),'../..');
const types={'.html':'text/html','.js':'text/javascript','.json':'application/json','.webmanifest':'application/manifest+json','.png':'image/png'};
const server=http.createServer((q,r)=>{const p=path.join(root,decodeURIComponent(q.url.split('?')[0]).replace(/^\/+/,'')||'index.html');const f=fs.existsSync(p)&&fs.statSync(p).isDirectory()?path.join(p,'index.html'):p;if(!f.startsWith(root)||!fs.existsSync(f)){r.writeHead(404);return r.end()}r.writeHead(200,{'content-type':types[path.extname(f)]||'application/octet-stream'});fs.createReadStream(f).pipe(r)});
await new Promise(ok=>server.listen(0,ok));const base='http://localhost:'+server.address().port+'/';
const browser=await chromium.launch();const errs=[];let step='';
const ctx=await browser.newContext({viewport:{width:390,height:844},timezoneId:'Europe/Berlin',locale:'de-DE',colorScheme:'dark',acceptDownloads:true});
const pg=await ctx.newPage();
pg.on('pageerror',e=>errs.push(step+': '+e.message));
pg.on('console',m=>{if(m.type()==='error'&&!/Failed to load resource|net::|ERR_/.test(m.text()))errs.push(step+': console '+m.text())});
pg.on('dialog',d=>d.accept());
await pg.route(/ytimg|youtube|noembed/,r=>r.abort());
const ev=(f,a)=>pg.evaluate(f,a),pass=[];
async function check(name,fn){step=name;await fn();pass.push(name)}
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
 await check('theme switch survives reload',async()=>{await ev(()=>lifeSetTheme('light'));await pg.reload();await pg.waitForTimeout(800);assert.equal(await ev(()=>document.documentElement.dataset.theme),'light');await ev(()=>{lifeCloseSheet();lifeSetTheme('auto')})});
 await check('every button on every screen',async()=>{
  const views=["goView('life')","lifeOpenMore()","lifeOpenSpaces('sinn')","lifeOpenSpaces('ideen')","lifeOpenLibrary()","goView('focus')","lifeOpenCalendar()","cosmosSetMode('week')","lifeOpenVideos()","lifeOpenSigils()","lifeOpenSky()","lifeOpenSongs()","goView('bodyhub')","goView('nutrition')","goView('mehub')"];
  const SKIP=/löschen|entfernen|export|backup|installieren|youtube|import|archiv|laden|bühnenmodus|einsingen/i;
  for(const v of views){step='crawl '+v;await ev(v);await pg.waitForTimeout(80);
   const n=await ev(()=>[...document.querySelectorAll('main .view.active button')].filter(e=>e.offsetParent).length);
   for(let i=0;i<n;i++){await ev(()=>{try{if(activeDialog)closeDialog(document.getElementById(activeDialog))}catch(_){}});await ev(v);
    const t=await ev(i=>{const e=[...document.querySelectorAll('main .view.active button')].filter(e=>e.offsetParent)[i];return e?(e.innerText+' '+(e.getAttribute('onclick')||'')):null},i);
    if(!t||SKIP.test(t))continue;step='crawl '+v+' #'+i+' '+t.slice(0,50);
    await ev(i=>{const e=[...document.querySelectorAll('main .view.active button')].filter(e=>e.offsetParent)[i];e&&e.click()},i);await pg.waitForTimeout(40)}}
 });
}catch(e){errs.push(step+': '+e.message)}
await browser.close();server.close();
console.log(pass.map(p=>'ok  '+p).join('\n'));
if(errs.length){console.error('\nFAILED in "'+step+'":\n'+[...new Set(errs)].map(e=>'  '+e).join('\n'));process.exit(1)}
console.log('\nE2E: '+pass.length+' checks passed, no JavaScript errors.');
