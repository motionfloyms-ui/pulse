const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const P=js('domain/content/daily.js'),D=js('domain/content/deck.js');
/* Shapes as the services answer (synthetic content). */
const APOD={date:'2026-10-21',title:'Ein Nebel im Schwan',explanation:'A glowing <i>cloud</i> of gas &amp; dust.',url:'https://apod.nasa.gov/apod/image/2610/nebel.jpg',hdurl:'https://apod.nasa.gov/apod/image/2610/nebel_big.jpg',media_type:'image',copyright:'\nJane Doe\n'};
const FEED={tfa:{title:'Beispiel_Artikel',titles:{normalized:'Beispiel Artikel'},description:'Ein Testartikel',extract:'Der Beispielartikel erklärt etwas.',thumbnail:{source:'https://upload.wikimedia.org/a.jpg'},content_urls:{mobile:{page:'https://de.m.wikipedia.org/wiki/Beispiel_Artikel'}}},
 image:{title:'File:Ein_Bild_vom_Meer.jpg',thumbnail:{source:'https://upload.wikimedia.org/thumb/meer.jpg/640px-meer.jpg'},image:{source:'https://upload.wikimedia.org/meer.jpg'},file_page:'https://commons.wikimedia.org/wiki/File:Ein_Bild_vom_Meer.jpg',artist:{text:'Max Muster'},license:{type:'CC BY-SA 4.0'},description:{text:'Wellen am Abend.',lang:'de'}}};
const ART={config:{iiif_url:'https://www.artic.edu/iiif/2'},data:[{id:1,title:'Ohne Bild',image_id:null},{id:27992,title:'Ein Sonntag',artist_display:'Georges Seurat\nFrankreich',date_display:'1884',medium_display:'Öl auf Leinwand',image_id:'2d484387-2509-5e8e-2c43-22f9981972eb',short_description:'Punkt für Punkt.'}]};
test('urls per source and day',()=>{
 assert.match(P.url('apod','2026-10-22'),/^https:\/\/api\.nasa\.gov\/planetary\/apod\?api_key=DEMO_KEY/);
 assert.equal(P.url('potd','2026-10-22'),'https://de.wikipedia.org/api/rest_v1/feed/featured/2026/10/22');
 assert.match(P.url('art','2026-10-22'),/is_public_domain\]=true.*&from=\d+$/);
});
test('parsing the answers, with credits and clean text',()=>{
 assert.deepEqual(P.parse('apod',APOD,'2026-10-22'),{title:'Ein Nebel im Schwan',img:APOD.url,big:APOD.hdurl,text:'A glowing cloud of gas & dust.',credit:'© Jane Doe',link:'https://apod.nasa.gov/apod/ap261021.html',lang:'en',video:false});
 const p=P.parse('potd',FEED,'2026-10-22');assert.deepEqual([p.title,p.credit,p.text,p.link],['Ein Bild vom Meer','Max Muster · CC BY-SA 4.0','Wellen am Abend.',FEED.image.file_page]);
 const t=P.parse('tfa',FEED,'2026-10-22');assert.deepEqual([t.title,t.sub,t.text],['Beispiel Artikel','Ein Testartikel','Der Beispielartikel erklärt etwas.']);
 const a=P.parse('art',ART,'2026-10-22');assert.equal(a.img,'https://www.artic.edu/iiif/2/2d484387-2509-5e8e-2c43-22f9981972eb/full/843,/0/default.jpg');assert.equal(a.sub,'Georges Seurat Frankreich · 1884 · Öl auf Leinwand');
 assert.equal(P.parse('apod',{title:'x',media_type:'video',url:'https://www.youtube.com/embed/x'},'2026-10-22'),null,'a video without thumbnail is skipped');
 assert.equal(P.parse('tfa',{},'2026-10-22'),null);assert.equal(P.parse('art',{data:[]},'2026-10-22'),null);assert.equal(P.parse('apod',null),null);
});
test('the stack gets one or two pictures of the day; they can be kept with a copy',()=>{
 const web=P.pick('2026-10-22',{topics:D.TOPICS,count:2});assert.equal(web.length,2);assert.notEqual(web[0],web[1]);
 assert.ok(P.pick('2026-10-22',{topics:['geist'],count:4}).every(k=>k==='potd'||k==='tfa'));
 const cards=['geist','kosmos'].flatMap(t=>Array.from({length:10},(_,i)=>({id:t+i,topic:t})));
 const st=D.build({day:'2026-10-22',cards,web});assert.equal(st.length,12);assert.equal(st[1].type,'web');assert.equal(st.filter(c=>c.type==='web').length,2);
 assert.equal(D.build({day:'2026-10-22',cards,web,size:8}).filter(c=>c.type==='web').length,1);
 const db={};assert.throws(()=>D.keep(db,'w:apod:2026-10-22','t'),/nicht geladen/);
 const k=D.keep(db,'w:apod:2026-10-22','t',{title:'Nebel',img:'https://x/y.jpg'});assert.equal(k.data.title,'Nebel');
 D.cache(db,'w:apod:2026-10-01',{ok:true},'2026-10-22');D.cache(db,'w:potd:2026-10-20',{ok:true},'2026-10-22');assert.deepEqual(Object.keys(db.deck.webCache),['w:potd:2026-10-20']);
});
