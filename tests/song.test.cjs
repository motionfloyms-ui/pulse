const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const S=js('domain/music/song.js'),K=js('domain/game/sky.js');
const T='2026-10-21T10:00:00.000Z';
const LYR='[Strophe 1]\nIch trage die Nacht / wie einen Mantel\nund jede Stimme bricht\n\n[Refrain]\nBrenn es aus\nBrenn es aus\n';
test('lyrics: sections, labels, breath marks, stable keys for repeats',()=>{
 const p=S.parse(LYR);assert.equal(p.length,2);assert.equal(p[0].label,'Strophe 1');assert.equal(p[1].label,'Refrain');
 assert.deepEqual(p[0][0].words,['Ich','trage','die','Nacht','wie','einen','Mantel']);assert.deepEqual(p[0][0].breaths,[4]);
 assert.deepEqual(p[1].map(l=>l.key),['brenn es aus#1','brenn es aus#2']);
 assert.equal(p[0][0].key,'ich trage die nacht / wie einen mantel#1'.replace(' /',' /'));
});
test('vocal map: annotate, emphasis, coverage, sheet',()=>{
 const db={};const s=S.create(db,{title:'Testlied',lyrics:LYR},T,'s1');
 assert.equal(s.no,1);assert.equal(s.status,'text');
 const k=S.parse(s.lyrics)[1][1].key;
 S.annotate(db,'s1',k,{dyn:'scream',color:'rau',breath:true,note:'volle Kraft'},T);
 S.toggleEmphasis(db,'s1',k,0,T);S.toggleEmphasis(db,'s1',k,2,T);S.toggleEmphasis(db,'s1',k,2,T);
 assert.deepEqual(s.notes[k],{dyn:'scream',color:'rau',breath:true,emph:[0],note:'volle Kraft'});
 S.annotate(db,'s1',k,{dyn:null,color:null,breath:false,emph:null,note:''},T);assert.equal(s.notes[k],undefined,'empty notes are removed');
 S.annotate(db,'s1',k,{dyn:'growl'},T);S.annotate(db,'s1',k,{dyn:'bogus'},T);assert.equal(s.notes[k],undefined,'unknown values are rejected');
 S.annotate(db,'s1',k,{dyn:'growl'},T);
 assert.deepEqual(S.coverage(s),{lines:4,done:1});
 S.toggleEmphasis(db,'s1',k,0,T);
 const sheet=S.sheet(s);assert.match(sheet,/\[Refrain\]\nBrenn es aus\nBRENN es aus   \[Growl\]/);assert.match(sheet,/Ich trage die Nacht \/ wie einen Mantel/);
});
test('takes, references, warm-ups, sky stars',()=>{
 const db={};S.create(db,{title:'A'},T,'a');assert.equal(S.get(db,'a').status,'idee');
 S.addTake(db,'a',{rating:4,note:'gut'},T);assert.equal(S.get(db,'a').status,'proben');S.link(db,'a','yt-AAAAAAAAAAA',true,T);S.link(db,'a','yt-AAAAAAAAAAA',true,T);assert.equal(S.get(db,'a').refs.length,1);
 S.warmup(db,'2026-10-21');
 const b=K.badges(db,{today:'2026-10-21'});const g=id=>b.find(x=>x.id===id);
 assert.equal(g('song1').done,true);assert.equal(g('take10').value,1);assert.equal(g('warm7').value,1);
 assert.throws(()=>S.create(db,{title:' '},T),/Titel|heißt/);
 const copy=JSON.parse(JSON.stringify(db));copy.songs.items.push({id:'a'},null,{id:'b',title:'',notes:{x:{dyn:'nope'}},takes:[{rating:9}]});S.normalize(copy);
 assert.equal(copy.songs.items.length,2);assert.deepEqual(copy.songs.items[1].notes,{});assert.equal(copy.songs.items[1].title,'Ohne Titel');
});
