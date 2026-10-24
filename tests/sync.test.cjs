const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const S=js('domain/sync/merge.js'),L=js('domain/life/model.js'),G=js('domain/magic/sigil.js'),V=js('domain/media/vault.js');
/* Synthetic data only. */
const T=(d,h=10)=>'2026-10-'+String(d).padStart(2,'0')+'T'+String(h).padStart(2,'0')+':00:00.000Z';
function base(){
 const db={days:{'2026-10-01':{water:2}},workouts:[{id:'w1',kg:40}],meals:[{id:'m1',kcal:300}],songs:{items:[{id:'s1',lyrics:'nur hier'}]},settings:{name:''}};
 L.create(db,{kind:'note',room:'innen',title:'Gemeinsame Notiz',body:'A'},'n1',T(1));
 L.create(db,{kind:'task',room:'alltag',title:'Aufgabe',date:'2026-10-24'},'t1',T(1));
 G.create(db,{intent:'Ich singe frei'},T(1),'sg1');
 V.add(db,{url:'https://youtu.be/AAAAAAAAAAA',title:'Video A'},T(1));
 return db;
}
const copy=o=>JSON.parse(JSON.stringify(o));
const move=(from,to,now)=>S.merge(to,S.read(JSON.parse(JSON.stringify(S.pack(from,{device:'Test',now})))),now);
const lifeOf=db=>copy(db.life.items).sort((a,b)=>a.id.localeCompare(b.id));
test('a package carries the shared mind, not the body and not the songs',()=>{
 const db=base();db.life.items[0].photos=['ph-abc123'];
 const p=S.pack(db,{device:'Handy',now:T(2),app:'30.0.0'});
 assert.equal(p.kind,'abgleich');assert.equal(p.device,'Handy');
 assert.deepEqual(Object.keys(p.data).sort(),['deck','life','magic','settings','sync','videos']);
 assert.equal(JSON.stringify(p).includes('nur hier'),false);assert.equal(JSON.stringify(p).includes('"kcal"'),false);
 assert.deepEqual(S.photoIds(p.data),['ph-abc123']);
});
test('read accepts packages and backups, refuses anything else',()=>{
 const db=base();
 assert.equal(S.read(S.pack(db)).kind,'abgleich');
 assert.equal(S.read({app:'PULSE',version:'29.0.0',data:db}).kind,'backup');
 assert.equal(S.read(db).kind,'backup');
 assert.throws(()=>S.read('x'),/kein PULSE-Paket/);
 assert.throws(()=>S.read({foo:1}),/nichts, was PULSE abgleichen kann/);
 assert.throws(()=>S.read({kind:'abgleich',format:99,data:{life:{items:[]}}}),/neueren PULSE-Version/);
});
test('new entries come in, the newer version wins, broken ones are skipped',()=>{
 const a=base(),b=copy(a);
 L.create(a,{kind:'note',room:'innen',title:'Seite aus der Quest',source:'raum',photos:['ph-q1']},'n2',T(3));
 L.update(a,'n1',{body:'A, neuer'},T(4));
 L.update(b,'t1',{title:'Aufgabe, hier neuer'},T(5));
 const pkg=S.pack(a,{now:T(6)});pkg.data.life.items.push({id:'kaputt',kind:'unbekannt',title:3});
 const r=S.merge(b,S.read(JSON.parse(JSON.stringify(pkg))),T(6));
 assert.deepEqual([r.life.added,r.life.updated,r.skipped],[1,1,1]);assert.deepEqual(r.photos,['ph-q1']);
 assert.equal(L.get(b,'n1').body,'A, neuer');assert.equal(L.get(b,'t1').title,'Aufgabe, hier neuer','the newer local version stays');
 L.validate(b.life);
});
test('two devices end up equal after one round in each direction',()=>{
 const a=base(),b=copy(a);
 L.create(a,{kind:'note',room:'sinn',title:'Nur auf dem Handy'},'na',T(3));
 L.create(b,{kind:'note',room:'innen',title:'Nur auf der Quest',source:'raum'},'nb',T(3));
 G.charge(b,'sg1',5,'still',T(4));
 G.create(a,{intent:'Neue Sigille vom Handy'},T(4),'sg2');
 b.life.preferences.tarotHistory=[{date:'2026-10-20',index:5,source:'digital'}];
 a.life.preferences.tarotHistory=[{date:'2026-10-21',index:9,source:'deck'}];
 move(a,b,T(6));move(b,a,T(7));
 assert.deepEqual(lifeOf(a),lifeOf(b));
 const sig=db=>copy(db.magic.sigils).sort((x,y)=>x.id.localeCompare(y.id)).map(s=>[s.id,s.status,s.charges.length]);
 assert.deepEqual(sig(a),sig(b));assert.deepEqual(sig(a),[['sg1','geladen',1],['sg2','neu',0]]);
 assert.deepEqual(a.life.preferences.tarotHistory.map(h=>h.date),['2026-10-20','2026-10-21']);
 assert.deepEqual(a.life.preferences.tarotHistory,b.life.preferences.tarotHistory);
 assert.equal(S.changes(move(b,a,T(8))),0,'a second round finds nothing new');
});
test('sigils: charges add up, the furthest state and the newest result win, numbers never clash',()=>{
 const a=base(),b=copy(a);
 G.charge(a,'sg1',3,'still',T(3));G.charge(b,'sg1',10,'ekstatisch',T(4));G.forget(b,'sg1',T(5));
 G.create(a,{intent:'Erste eigene'},T(3),'sgA');G.create(b,{intent:'Zweite eigene'},T(3),'sgB');
 move(b,a,T(6));
 const s=a.magic.sigils.find(x=>x.id==='sg1');assert.equal(s.charges.length,2);assert.equal(s.status,'vergessen');assert.equal(s.forgottenAt,T(5));
 const nos=a.magic.sigils.map(x=>x.no);assert.equal(new Set(nos).size,nos.length);
 G.result(b,'sg1','Hat geklappt',8,T(9));move(b,a,T(10));assert.equal(a.magic.sigils.find(x=>x.id==='sg1').status,'erfuellt');
 G.normalize(a);
});
test('tarot: one card per day stays as it is, own meanings are combined',()=>{
 const a=base(),b=copy(a);
 a.life.preferences.tarotHistory=[{date:'2026-10-22',index:1,source:'digital'}];b.life.preferences.tarotHistory=[{date:'2026-10-22',index:7,source:'deck'},{date:'2026-10-23',index:2,source:'digital'}];
 b.life.preferences.tarot={date:'2026-10-23',index:2,source:'digital'};a.life.preferences.tarot={date:'2026-10-22',index:1,source:'digital'};
 a.life.preferences.tarotNotes={'3':'Meins'};b.life.preferences.tarotNotes={'3':'Von drüben','4':'Neu'};
 const r=move(b,a,T(6));
 assert.deepEqual(a.life.preferences.tarotHistory.map(h=>[h.date,h.index]),[['2026-10-22',1],['2026-10-23',2]]);
 assert.deepEqual(a.life.preferences.tarot,{date:'2026-10-23',index:2,source:'digital'});
 assert.deepEqual(a.life.preferences.tarotNotes,{'3':'Meins\n\nVon drüben','4':'Neu'});
 assert.deepEqual([r.tarot.days,r.tarot.notes,r.tarot.today],[1,2,true]);
 assert.equal(move(b,a,T(7)).tarot.notes,0,'combined notes do not grow again');
});
test('videos: shelves meet by name, collector numbers stay unique',()=>{
 const a=base(),b=copy(a);
 V.addShelf(a,'Growls','',T(2),'sh-a');V.addShelf(b,'growls','',T(2),'sh-b');
 V.add(b,{url:'https://youtu.be/BBBBBBBBBBB',title:'Nur drüben'},T(3));V.setShelf(b,'yt-BBBBBBBBBBB','sh-b',true,T(3));
 V.add(a,{url:'https://youtu.be/CCCCCCCCCCC',title:'Nur hier'},T(3));
 V.update(b,'yt-AAAAAAAAAAA',{title:'Video A, umbenannt'},T(4));
 const r=move(b,a,T(5));V.normalize(a);
 assert.deepEqual([r.videos.added,r.videos.updated,r.shelves],[1,1,0]);
 assert.equal(a.videos.shelves.length,1);assert.deepEqual(V.get(a,'BBBBBBBBBBB').shelves,['sh-a']);
 const nos=a.videos.items.map(x=>x.no);assert.equal(new Set(nos).size,3);assert.equal(V.get(a,'AAAAAAAAAAA').title,'Video A, umbenannt');
 assert.equal(V.get(a,'AAAAAAAAAAA').no,1,'an updated video keeps its number here');
});
test('deleted stays deleted: tombstones travel, an older copy does not come back, undo revives',()=>{
 const a=base(),b=copy(a);
 a.life.items=a.life.items.filter(x=>x.id!=='n1');S.forget(a,'life','n1',T(3));
 G.remove(a,'sg1');S.forget(a,'sigil','sg1',T(3));
 V.remove(a,'AAAAAAAAAAA');S.forget(a,'video','yt-AAAAAAAAAAA',T(3));
 const r=move(a,b,T(4));
 assert.equal(r.removed,3);assert.ok(!L.get(b,'n1'));assert.equal(b.magic.sigils.length,0);assert.equal(b.videos.items.length,0);
 const back=move(copy(base()),a,T(5));assert.ok(!L.get(a,'n1'),'old copies from a third device stay out');assert.equal(back.removed,0);
 const c=copy(base());L.update(c,'n1',{body:'Danach noch geändert'},T(6));move(c,a,T(7));
 assert.equal(L.get(a,'n1').body,'Danach noch geändert','an edit after the deletion wins');
 S.revive(a,'sigil',['sg1']);move(copy(base()),a,T(8));assert.equal(a.magic.sigils.length,1);
});
test('kept cards and the name: added once, numbers unique, a name here is kept',()=>{
 const a=base(),b=copy(a);
 a.deck={kept:[{ref:'c:geist-1',at:T(2),no:1}],next:2};b.deck={kept:[{ref:'c:kosmos-4',at:T(2),no:1},{ref:'c:geist-1',at:T(2),no:2}],next:3};
 b.settings.name='Lina';
 const r=move(b,a,T(3));
 assert.equal(r.kept,1);assert.deepEqual(a.deck.kept.map(k=>[k.ref,k.no]),[['c:geist-1',1],['c:kosmos-4',2]]);assert.equal(a.deck.next,3);
 assert.equal(a.settings.name,'Lina');
 b.settings.name='Andere';move(b,a,T(4));assert.equal(a.settings.name,'Lina');
});
test('preview changes nothing',()=>{
 const a=base(),b=copy(a);L.create(b,{kind:'note',room:'innen',title:'Neu'},'nx',T(3));
 const before=JSON.stringify(a),r=S.preview(a,S.read(S.pack(b)),T(4));
 assert.equal(r.life.added,1);assert.equal(JSON.stringify(a),before);
});
