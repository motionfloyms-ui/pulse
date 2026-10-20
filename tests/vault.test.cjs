const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const V=js('domain/media/vault.js');
const T='2026-10-20T20:00:00.000Z';
test('collector numbers count up and duplicates are recognised',()=>{
 const db={};
 const a=V.add(db,{url:'https://youtu.be/AAAAAAAAAAA',title:'Erstes'},T),b=V.add(db,{url:'https://www.youtube.com/watch?v=BBBBBBBBBBB'},T);
 assert.deepEqual([a.item.no,b.item.no],[1,2]);
 const d=V.add(db,{url:'https://youtube.com/watch?v=AAAAAAAAAAA&t=20'},T);assert.equal(d.duplicate,true);assert.equal(d.item.no,1);assert.equal(db.videos.items.length,2);
 V.remove(db,'yt-BBBBBBBBBBB');assert.equal(V.add(db,{url:'https://youtu.be/CCCCCCCCCCC'},T).item.no,3,'numbers are never reused');
 assert.throws(()=>V.add(db,{url:'https://vimeo.com/1'},T),/kein YouTube/);
});
test('shelves, status, favourites and marks',()=>{
 const db={};V.add(db,{url:'https://youtu.be/AAAAAAAAAAA'},T);
 const h=V.addShelf(db,'Growls','🎤',T,'sh-1');assert.throws(()=>V.addShelf(db,'growls','',T),/schon/);
 V.setShelf(db,'yt-AAAAAAAAAAA','sh-1',true,T);assert.deepEqual(V.get(db,'AAAAAAAAAAA').shelves,['sh-1']);
 V.watched(db,'yt-AAAAAAAAAAA',T);V.watched(db,'yt-AAAAAAAAAAA',T);V.update(db,'yt-AAAAAAAAAAA',{fav:true},T);
 const x=V.get(db,'yt-AAAAAAAAAAA');assert.equal(x.status,'gesehen');assert.equal(x.seen,2);assert.equal(x.fav,true);
 V.addMark(db,x.id,'1:23','Atem',T);V.addMark(db,x.id,'0:05','Start',T);assert.deepEqual(x.marks.map(m=>m.t),[5,83]);
 assert.throws(()=>V.addMark(db,x.id,'abc','',T),/Zeit/);
 V.removeShelf(db,h.id);assert.deepEqual(x.shelves,[]);
});
test('time parsing and formatting',()=>{
 assert.equal(V.parseTime('1:23'),83);assert.equal(V.parseTime('1:02:03'),3723);assert.equal(V.parseTime('90'),90);assert.equal(V.parseTime('2m5s'),125);assert.equal(V.parseTime('1:75'),null);
 assert.equal(V.fmtTime(83),'1:23');assert.equal(V.fmtTime(3723),'1:02:03');
});
test('query, groups, stats and milestones',()=>{
 const db={};const ids=['AAAAAAAAAAA','BBBBBBBBBBB','CCCCCCCCCCC'];
 ids.forEach((id,i)=>V.add(db,{url:'https://youtu.be/'+id,title:['Zebra','Apfel','Mitte'][i],room:i?'ideen':'koerper'},'2026-10-2'+i));
 V.ensure(db).items[1].channel='Kanal X';V.update(db,'yt-CCCCCCCCCCC',{fav:true},T);
 assert.deepEqual(V.query(db,{sort:'titel'}).map(x=>x.title),['Apfel','Mitte','Zebra']);
 assert.deepEqual(V.query(db,{filter:'fav'}).map(x=>x.vid),['CCCCCCCCCCC']);
 assert.equal(V.query(db,{q:'#2'}).length,1);assert.equal(V.query(db,{room:'ideen'}).length,2);
 assert.deepEqual(V.groups(db,'channel').map(g=>g.name),['Kanal X','Kanal unbekannt']);
 const s=V.stats(db);assert.equal(s.total,3);assert.equal(s.next,10);assert.equal(s.left,7);
 assert.equal(V.reached(9,10),10);assert.equal(V.reached(10,11),null);assert.equal(V.reached(0,1),1);
 assert.equal(V.random(db,'neu',()=>0).title.length>0,true);
});
test('YouTube notes move from the rooms into the collection once',()=>{
 const db={life:{version:1,items:[{id:'l1',kind:'note',title:'Gesang',body:'gut',url:'https://youtu.be/AAAAAAAAAAA',room:'ideen',createdAt:'2026-10-20'},{id:'l2',kind:'note',title:'YouTube-Video',body:'',url:'https://youtu.be/BBBBBBBBBBB',room:'alltag',createdAt:'2026-10-21'},{id:'l3',kind:'note',title:'Andere Notiz',body:'',url:'https://example.com',room:'alltag'}]}};
 assert.equal(V.adoptFromLife(db,T),2);assert.deepEqual(db.life.items.map(x=>x.id),['l3']);
 const v=V.query(db,{sort:'nummer'});assert.deepEqual(v.map(x=>[x.no,x.title,x.room,x.note]),[[1,'Gesang','ideen','gut'],[2,'','alltag','']]);
 assert.equal(V.adoptFromLife(db,T),0);
});
test('normalize repairs broken data from old backups',()=>{
 const db={videos:{items:[{vid:'AAAAAAAAAAA',no:0,shelves:['gone'],marks:[{t:5}],addedAt:'b'},{vid:'AAAAAAAAAAA'},{vid:'bad'},null],shelves:[{id:'s',name:''}]}};
 const s=V.normalize(db);assert.equal(s.items.length,1);assert.equal(s.items[0].no,1);assert.deepEqual(s.items[0].shelves,[]);assert.equal(s.shelves[0].name,'Regal');assert.equal(s.next,2);
});
test('playlists are collected next to videos',()=>{
 const db={};V.add(db,{url:'https://youtu.be/AAAAAAAAAAA'},T);
 const p=V.add(db,{url:'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG',title:'Growl-Kurs'},T);
 assert.equal(p.item.kind,'playlist');assert.equal(p.item.no,2);assert.equal(p.item.id,'pl-PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG');
 assert.equal(V.add(db,{url:'https://youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&si=x'},T).duplicate,true);
 assert.deepEqual(V.query(db,{filter:'playlist'}).map(x=>x.title),['Growl-Kurs']);
 assert.equal(V.stats(db).playlists,1);
 V.update(db,p.item.id,{thumb:'https://i.ytimg.com/vi/AAAAAAAAAAA/hqdefault.jpg'},T);assert.ok(p.item.thumb);V.update(db,p.item.id,{thumb:'https://evil.com/x.jpg'},T);assert.equal(p.item.thumb,'');
 const again=JSON.parse(JSON.stringify(db));V.normalize(again);assert.equal(again.videos.items.length,2);assert.equal(again.videos.items[1].kind,'playlist');
});
