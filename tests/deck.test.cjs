const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const D=js('domain/content/deck.js');
const cards=['geist','kosmos','magie','stimme','kunst','schreiben'].flatMap(t=>Array.from({length:8},(_,i)=>({id:t+'-'+i,topic:t})));
const vid=i=>('v'+String(i).padStart(10,'0')).slice(0,11);
const videos=Array.from({length:40},(_,i)=>({kind:'video',vid:vid(i),status:i<30?'neu':'gesehen',fav:i===35,shelves:[['s1','s2','s3'][i%3]]}));
const own=[{id:'n-old',createdAt:'2026-08-01T10:00:00.000Z'},{id:'n-new',createdAt:'2026-10-19T10:00:00.000Z'}];
const src={cards,videos,own,tarot:78};
test('a stack per day: fixed size, same every time that day, sky first',()=>{
 const a=D.build({...src,day:'2026-10-22'}),b=D.build({...src,day:'2026-10-22'}),c=D.build({...src,day:'2026-10-23'});
 assert.equal(a.length,12);assert.deepEqual(a,b);assert.notDeepEqual(a,c);assert.equal(a[0].type,'sky');
 const types=a.map(x=>x.type);assert.equal(types.filter(t=>t==='video').length,4);assert.equal(types.filter(t=>t==='tarot').length,1);assert.equal(types.filter(t=>t==='own').length,1);assert.equal(types.filter(t=>t==='card').length,5);
 assert.ok(a.some(x=>x.ref==='o:n-old'));assert.ok(!a.some(x=>x.ref==='o:n-new'));
 const v=a.filter(x=>x.type==='video').map(x=>Number(x.ref.slice(3)));assert.ok(v.every(i=>i<30),'unwatched first');
 const topics=new Set(a.filter(x=>x.type==='card').map(x=>x.ref.split(':')[1].split('-')[0]));assert.equal(topics.size,5,'spread over topics');
});
test('nothing comes back too soon, kept cards stay out, topics and size are respected',()=>{
 const db={};D.ensure(db);
 D.today(db,'2026-10-22',src);for(let i=0;i<=db.deck.cards.length;i++)D.go(db,i);
 const first=db.deck.cards.map(x=>x.ref);assert.ok(D.finished(db));
 D.keep(db,first.find(r=>r.startsWith('c:')),'t');
 D.today(db,'2026-10-23',src);const second=db.deck.cards.map(x=>x.ref);
 assert.equal(second.filter(r=>r.startsWith('v:')||r.startsWith('c:')).filter(r=>first.includes(r)).length,0);
 assert.notEqual(second.find(r=>r.startsWith('t:')),first.find(r=>r.startsWith('t:')));
 assert.deepEqual(db.deck.log.map(l=>[l.day,l.shown,l.total,l.kept]),[['2026-10-22',12,12,1]]);
 const only=D.build({...src,day:'2026-10-24',topics:['kosmos'],size:8});assert.ok(only.filter(x=>x.type==='card').every(x=>x.ref.startsWith('c:kosmos')));assert.ok(!only.some(x=>x.type==='tarot'));assert.equal(only.length,8);
 const none=D.build({cards,day:'2026-10-24'});assert.equal(none.length,12);assert.equal(none.filter(x=>x.type==='card').length,11);
});
test('keep, settings and summary',()=>{
 const db={};D.today(db,'2026-10-22',src);D.go(db,0);
 assert.throws(()=>D.keep(db,'v:x','t'),/Nur Karten/);const k=D.keep(db,'c:geist-1','t');assert.equal(k.no,1);assert.ok(D.isKept(db,'c:geist-1'));
 assert.equal(D.keep(db,'c:geist-1','t'),null);assert.equal(D.keep(db,'c:geist-1','t').no,2);
 assert.equal(D.configure(db,{size:16}),true);D.today(db,'2026-10-22',src);assert.equal(db.deck.cards.length,16);
 D.go(db,3);assert.equal(D.configure(db,{size:8}),false);D.today(db,'2026-10-22',src);assert.equal(db.deck.cards.length,16);
 assert.throws(()=>D.configure(db,{topics:[]}),/Mindestens/);
 D.watched(db);assert.deepEqual(D.summary(db),{days:1,finished:0,kept:1,watched:1});
 const broken={deck:{cards:'x',seen:[],kept:[null,{ref:'c:a',no:4}],size:7,topics:['nope']}};D.ensure(broken);assert.deepEqual([broken.deck.cards,broken.deck.size,broken.deck.next,broken.deck.topics.length],[[],12,5,6]);
});
