const test=require('node:test'),assert=require('node:assert/strict'),zlib=require('node:zlib');const {js}=require('./helpers.cjs');
const K=js('domain/media/takeout.js'),V=js('domain/media/vault.js');
/* A tiny ZIP writer for synthetic Takeout archives (no personal data). */
function crc32(b){let crc=0xFFFFFFFF;for(const x of b){let c=(crc^x)&0xFF;for(let k=0;k<8;k++)c=c&1?0xEDB88320^(c>>>1):c>>>1;crc=(crc>>>8)^c}return (crc^0xFFFFFFFF)>>>0}
function zip(files,{deflate=true}={}){
 const parts=[],central=[];let offset=0;
 for(const f of files){
  const name=Buffer.from(f.name,'utf8'),data=Buffer.from(f.text,'utf8'),body=deflate?zlib.deflateRawSync(data):data,crc=crc32(data),m=deflate?8:0;
  const lh=Buffer.alloc(30);lh.writeUInt32LE(0x04034b50,0);lh.writeUInt16LE(20,4);lh.writeUInt16LE(0x0800,6);lh.writeUInt16LE(m,8);lh.writeUInt32LE(crc,14);lh.writeUInt32LE(body.length,18);lh.writeUInt32LE(data.length,22);lh.writeUInt16LE(name.length,26);
  parts.push(lh,name,body);
  const ch=Buffer.alloc(46);ch.writeUInt32LE(0x02014b50,0);ch.writeUInt16LE(20,4);ch.writeUInt16LE(20,6);ch.writeUInt16LE(0x0800,8);ch.writeUInt16LE(m,10);ch.writeUInt32LE(crc,16);ch.writeUInt32LE(body.length,20);ch.writeUInt32LE(data.length,24);ch.writeUInt16LE(name.length,28);ch.writeUInt32LE(offset,42);
  central.push(ch,name);offset+=30+name.length+body.length;
 }
 const cd=Buffer.concat(central),end=Buffer.alloc(22);end.writeUInt32LE(0x06054b50,0);end.writeUInt16LE(files.length,8);end.writeUInt16LE(files.length,10);end.writeUInt32LE(cd.length,12);end.writeUInt32LE(offset,16);
 return new Uint8Array(Buffer.concat([...parts,cd,end]));
}
const inflate=b=>Promise.resolve(new Uint8Array(zlib.inflateRawSync(b)));
const A='AAAAAAAAAAA',B='BBBBBBBBBBB',C='CCCCCCCCCCC',D='DDDDDDDDDDD';
const FILES=[
 {name:'Takeout/YouTube and YouTube Music/playlists/Growls-videos.csv',text:'Video ID,Playlist Video Creation Timestamp\r\n'+A+',2021-03-04T10:00:00+00:00\r\n'+B+',2020-01-02T09:00:00+00:00\r\n'},
 {name:'Takeout/YouTube und YouTube Music/Playlists/Mond _ Ritual-Videos.csv',text:'﻿Video-ID,Zeitstempel der Erstellung des Playlist-Videos\n'+B+',2019-05-06T08:00:00+00:00\n'+C+',2022-07-08T07:00:00+00:00\n'+C+',2022-07-09T07:00:00+00:00\n'},
 {name:'Takeout/YouTube und YouTube Music/Playlists/Playlists.csv',text:'Playlist-ID,Playlist-Titel (Original),Sichtbarkeit der Playlist\nPLx1,"Mond & Ritual",Private\nPLx2,Growls,Public\n'},
 {name:'Takeout/YouTube/playlists/Später ansehen.csv',text:'Playlist-ID,Kanal-ID,Zeitstempel der Erstellung,Zeitstempel der letzten Aktualisierung,Titel,Sichtbarkeit\nWL,UCxyz,2018-01-01 10:00:00 UTC,2024-01-01 10:00:00 UTC,Später ansehen,Private\n\nVideo-ID,Zeitstempel der Hinzufügung zur Playlist\n'+D+',2018-02-03 10:00:00 UTC\n'+A+',2018-03-03 10:00:00 UTC\n'},
 {name:'Takeout/YouTube und YouTube Music/Abos/Abos.csv',text:'Kanal-ID,Kanal-URL,Kanaltitel\nUCabc,http://www.youtube.com/channel/UCabc,Irgendwer\n'}
];
test('csv: quotes, commas and line breaks inside quotes, BOM, CRLF',()=>{
 assert.deepEqual(K.csv('﻿a,"b,c","d ""e"""\r\n"x\ny",2\n'),[['a','b,c','d "e"'],['x\ny','2']]);
 assert.equal(K.when('2019-02-03 10:00:00 UTC'),'2019-02-03T10:00:00.000Z');assert.equal(K.when('2021-03-04T10:00:00+01:00'),'2021-03-04T09:00:00.000Z');assert.equal(K.when('kaputt'),'');
});
test('reads a Takeout ZIP: new and old format, German and English, overview titles, watch later',async()=>{
 for(const deflate of [true,false]){
  const lists=await K.read([{name:'takeout.zip',bytes:zip(FILES,{deflate})}],{inflate});
  assert.deepEqual(lists.map(l=>[l.title,l.videos.map(v=>v.vid)]),[['Growls',[A,B]],['Mond & Ritual',[B,C]],['Später ansehen',[D,A]]]);
  assert.equal(lists[2].videos[0].at,'2018-02-03T10:00:00.000Z');
 }
});
test('loose CSV files work too, and wrong files say what is missing',async()=>{
 const lists=await K.read([{name:'Growls-videos.csv',bytes:new TextEncoder().encode(FILES[0].text)}],{inflate});
 assert.deepEqual(lists.map(l=>l.title),['Growls']);
 await assert.rejects(K.read([{name:'abos.csv',bytes:new TextEncoder().encode(FILES[4].text)}],{inflate}),/keine YouTube-Playlists/);
 await assert.rejects(K.read([{name:'x.zip',bytes:new Uint8Array([0x50,0x4b,1,2,3])}],{inflate}),/keine ZIP-Datei/);
});
test('import into the collection: shelves, numbers oldest first, nothing twice',async()=>{
 const db={};V.add(db,{url:'https://youtu.be/'+A},'2017-01-01T00:00:00.000Z');
 const lists=await K.read([{name:'t.zip',bytes:zip(FILES)}],{inflate});
 assert.deepEqual(V.importPreview(db,lists),{lists:[{title:'Growls',count:2,fresh:1},{title:'Mond & Ritual',count:2,fresh:2},{title:'Später ansehen',count:2,fresh:1}],unique:4,already:1,fresh:3});
 const r=V.importLists(db,lists,'2026-10-22T00:00:00.000Z');
 assert.deepEqual([r.added,r.shelves,r.linked,r.total],[3,3,2,4]);
 const no=id=>V.get(db,id).no;assert.deepEqual([no(A),no(D),no(B),no(C)],[1,2,3,4]);
 assert.equal(V.get(db,B).addedAt,'2019-05-06T08:00:00.000Z');assert.equal(V.get(db,B).shelves.length,2);
 const again=V.importLists(db,lists,'2026-10-23T00:00:00.000Z');assert.deepEqual([again.added,again.shelves,again.linked],[0,0,0]);
 V.normalize(db);assert.equal(db.videos.items.length,4);assert.equal(db.videos.shelves.length,3);
});
test('an import can be taken back completely',async()=>{
 const db={};V.add(db,{url:'https://youtu.be/'+A},'2017-01-01T00:00:00.000Z');const next=db.videos.next;
 const r=V.importLists(db,await K.read([{name:'t.zip',bytes:zip(FILES)}],{inflate}),'2026-10-22T00:00:00.000Z');
 V.undoImport(db,{...r.ids,next});
 assert.deepEqual(db.videos.items.map(x=>[x.id,x.shelves]),[['yt-'+A,[]]]);assert.equal(db.videos.shelves.length,0);assert.equal(db.videos.next,next);
});
