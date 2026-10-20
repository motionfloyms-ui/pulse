const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const S=js('domain/magic/sigil.js'),C=js('domain/content/cutup.js'),K=js('domain/game/sky.js');
const T='2026-10-21T10:00:00.000Z';
test('sigil letters: umlauts folded, vowels and duplicates removed',()=>{
 assert.equal(S.reduce('Ich schlafe tief und ruhig.'),'CHSLFTNDRG');
 assert.equal(S.reduce('Ich singe frei'),'CHSNGFR');
 assert.equal(S.reduce('Äöü ß'),'S');
 assert.equal(S.reduce('aeiou'),'AEIOU','only vowels: keep them');
 assert.equal(S.reduce('Ich singe',{vowels:true}),'ICHSNGE');
});
test('sigil drawing is deterministic and stays inside the frame',()=>{
 for(const method of ['rad','quadrat'])for(const style of ['gerade','geschwungen']){
  const a=S.draw('CHSLFTNDRG',{method,style,seed:42}),b=S.draw('CHSLFTNDRG',{method,style,seed:42});
  assert.equal(a.d,b.d);assert.ok(a.d.startsWith('M'));
  for(const p of a.points){assert.ok(p.x>=0&&p.x<=200&&p.y>=0&&p.y<=200,method+' '+p.x+','+p.y)}
 }
 assert.notEqual(S.draw('CHSLFTNDRG',{seed:1}).d,S.draw('CHSLFTNDRG',{seed:2}).d,'re-roll changes the glyph');
 assert.match(S.svg('AB',{}),/<path d="M/);assert.equal(S.draw('',{}).d,'');
 assert.deepEqual([S.value('A'),S.value('I'),S.value('J'),S.value('Z')],[1,9,1,8]);
});
test('sigil journal: create, charge, forget, result',()=>{
 const db={};const s=S.create(db,{intent:'Ich schlafe tief und ruhig.',phase:0},T,'sg-1');
 assert.equal(s.no,1);assert.equal(s.status,'neu');assert.equal(s.letters,'CHSLFTNDRG');
 S.charge(db,'sg-1',3,'still',T);assert.equal(s.status,'geladen');S.forget(db,'sg-1',T);assert.equal(s.status,'vergessen');
 S.result(db,'sg-1','Seit Tagen gut geschlafen',7,T);assert.equal(s.status,'erfuellt');
 assert.throws(()=>S.create(db,{intent:'a'},T),/Absicht/);
 const again=JSON.parse(JSON.stringify(db));again.magic.sigils.push({id:'sg-1'},{id:'x',intent:'Mut',letters:''},null);S.normalize(again);
 assert.equal(again.magic.sigils.length,2);assert.equal(again.magic.sigils[1].letters,'MT');
});
test('cut-up keeps words, mixes order, is reproducible',()=>{
 const text='Ich trage die Nacht wie einen Mantel\nund jede Stimme bricht am Morgen\nwir singen gegen das Licht';
 const a=C.lines(text,{seed:7,count:8}),b=C.lines(text,{seed:7,count:8});
 assert.deepEqual(a,b);assert.ok(a.length>=5);
 const words=new Set(text.toLowerCase().split(/\s+/));for(const l of a)for(const w of l.toLowerCase().split(/\s+/))assert.ok(words.has(w),w);
 assert.ok(a.some(l=>!text.includes(l)),'at least one new combination');
 assert.ok(C.fragments(text,'zeilen').length>=4);
 assert.doesNotThrow(()=>C.lines('a b',{seed:1}));assert.doesNotThrow(()=>C.lines('eins zwei\ndrei vier',{seed:3,count:20}));
});
test('sky: stars from data, glow, yesterday',()=>{
 const db={days:{'2026-10-20':{protein:110,water:2.1},'2026-10-19':{protein:40,water:0.5}},workouts:[{date:'2026-10-20'},{date:'2026-10-20'},{date:'2026-10-18'}],meals:[{date:'2026-10-20'}],waterGoal:2,
  life:{items:[{kind:'task',status:'done',updatedAt:'2026-10-20T18:00:00Z',createdAt:'2026-10-19T08:00:00Z'}],preferences:{tarotHistory:[{index:0,date:'2026-10-20'},{index:5,date:'2026-10-19'}]}},
  videos:{items:[{addedAt:'2026-10-20T20:00:00Z',marks:[]}],shelves:[]},magic:{sigils:[{createdAt:'2026-10-20T09:00:00Z',charges:[{at:'2026-10-20T09:05:00Z'}],forgottenAt:''}]}};
 const b=K.badges(db,{today:'2026-10-21',proteinGoal:100,phaseOf:()=>3});
 const get=id=>b.find(x=>x.id===id);
 assert.equal(get('t1').done,true);assert.equal(get('t22').value,2);assert.equal(get('w1').done,true);assert.equal(get('w10').value,2);
 assert.equal(get('v1').done,true);assert.equal(get('s1').done,true);assert.equal(get('sc').done,true);assert.equal(get('moon').value,1);
 assert.ok(b.every(x=>Number.isFinite(x.x)&&Number.isFinite(x.y)));
 const g=K.glow(db,'2026-10-21',{proteinGoal:100});assert.equal(g.length,91);assert.equal(g.at(-2).date,'2026-10-20');assert.equal(g.at(-2).level,4);assert.equal(g.at(-1).level,0);
 assert.deepEqual(K.yesterday(db,'2026-10-21',{proteinGoal:100}),['1 Aufgabe erledigt','Training','110 g Protein','2,1 L Wasser','1 Video gesammelt','Tageskarte','eine Sigille']);
 assert.equal(K.rank(0).name,'Dämmerung');assert.equal(K.rank(5).name,'Sternbild');
});
