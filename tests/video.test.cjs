const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const V=js('domain/media/video.js');
test('recognises the usual YouTube link forms',()=>{
 for(const u of ['https://youtu.be/dQw4w9WgXcQ','https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=x','https://m.youtube.com/watch?v=dQw4w9WgXcQ','https://youtube.com/shorts/dQw4w9WgXcQ?si=abc','https://music.youtube.com/watch?v=dQw4w9WgXcQ','https://www.youtube.com/embed/dQw4w9WgXcQ','https://www.youtube.com/live/dQw4w9WgXcQ'])assert.equal(V.parse(u)?.id,'dQw4w9WgXcQ',u);
});
test('rejects other links and broken ids',()=>{
 for(const u of ['https://vimeo.com/123','https://youtube.com/watch?v=short','https://evil.com/watch?v=dQw4w9WgXcQ','javascript:alert(1)','','https://youtube.com.evil.com/watch?v=dQw4w9WgXcQ'])assert.equal(V.parse(u),null,u);
});
test('start time and embed address',()=>{
 const v=V.parse('https://youtu.be/dQw4w9WgXcQ?t=1m30s');assert.equal(v.start,90);
 assert.equal(V.embed(v),'https://www.youtube-nocookie.com/embed/dQw4w9WgXcQ?rel=0&playsinline=1&modestbranding=1&autoplay=1&start=90');
 assert.equal(V.parse('https://www.youtube.com/watch?v=dQw4w9WgXcQ&t=42').start,42);
});
test('finds a video inside shared text',()=>{
 const f=V.find('Schau mal: Gesangsübung https://youtu.be/dQw4w9WgXcQ?si=xy toll');assert.equal(f.id,'dQw4w9WgXcQ');assert.equal(f.url,'https://youtu.be/dQw4w9WgXcQ?si=xy');
 assert.equal(V.find('kein Video hier https://example.com'),null);
});
test('suggests a room from the video title',()=>{
 assert.equal(V.room('Hip Thrust richtig ausführen – Technik'),'koerper');
 assert.equal(V.room('Vocal warm up for growls and screams'),'ideen');
 assert.equal(V.room('Chaos Magic: how to make a sigil'),'sinn');
 assert.equal(V.room('Grounding exercise for dissociation'),'innen');
 assert.equal(V.room('Irgendwas Lustiges'),'');
 assert.equal(V.room('Irgendwas',{music:true}),'ideen');
});
test('playlist links',()=>{
 const p=V.parseAny('https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&si=1');assert.equal(p.type,'playlist');assert.equal(p.list,'PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG');
 assert.equal(V.parseAny('https://www.youtube.com/watch?v=dQw4w9WgXcQ&list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG').type,'video','a video inside a playlist is the video');
 assert.equal(V.parseAny('https://music.youtube.com/playlist?list=OLAK5uy_kXYZabcdefghij').music,true);
 assert.equal(V.parseAny('https://www.youtube.com/playlist?list=WL'),null,'private watch-later list');
 assert.equal(V.embed({list:'PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'}),'https://www.youtube-nocookie.com/embed/videoseries?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG&rel=0&playsinline=1&autoplay=1');
 assert.equal(V.watch({list:'PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG'}),'https://www.youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG');
 assert.equal(V.findAny('Meine Liste: https://youtube.com/playlist?list=PLx0sYbCqOb8TBPRdmBHs5Iftvv9TPboYG.').type,'playlist');
});
