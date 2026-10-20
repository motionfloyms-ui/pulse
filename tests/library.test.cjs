const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const L=js('domain/content/library.js');
test('78 distinct tarot cards with full texts',()=>{assert.equal(L.TAROT.length,78);assert.equal(new Set(L.TAROT.map(c=>c.name)).size,78);for(const c of L.TAROT){assert.ok(c.keywords&&c.reversed&&c.question,c.name);assert.ok(c.question.endsWith('?'),c.name)}});
test('court cards carry The Wild Unknown names',()=>{assert.equal(L.TAROT[22+10].wildUnknown,'Tochter der Stäbe');assert.equal(L.TAROT[77].wildUnknown,'Vater der Pentakel')});
test('moon phases: full moon on 26 Oct 2026, new moon on 9 Nov 2026',()=>{assert.equal(L.moon('2026-10-26').name,'Vollmond');assert.equal(L.moon('2026-11-09').name,'Neumond')});
test('library ids are unique and every entry has a known type and room',()=>{const ids=L.ENTRIES.map(e=>e.id);assert.equal(new Set(ids).size,ids.length);for(const e of L.ENTRIES){assert.ok(L.TYPES[e.type],e.id);assert.ok(['alltag','innen','sinn','koerper','menschen','ideen','draussen','zuhause'].includes(e.room),e.id)}});
test('recipes respect the household: no mushrooms, aubergine or fish',()=>{for(const e of L.ENTRIES.filter(e=>e.type==='recipe')){const t=(e.body+' '+e.steps.join(' ')).toLowerCase().replace(/ohne pilze/g,'');for(const bad of ['pilz','champignon','aubergine','lachs','thunfisch','fisch'])assert.ok(!t.includes(bad),e.title+' contains '+bad)}});
test('daily picks are stable for a date',()=>assert.equal(L.daily('2026-10-20','recipe','koerper').id,L.daily('2026-10-20','recipe','koerper').id));
