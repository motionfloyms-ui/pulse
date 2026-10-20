const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const C=js('domain/cosmos/calendar.js');
test('Chinese New Year dates 2023–2028',()=>{for(const [y,d] of [[2023,'2023-01-22'],[2024,'2024-02-10'],[2025,'2025-01-29'],[2026,'2026-02-17'],[2027,'2027-02-06'],[2028,'2028-01-26']])assert.equal(C.fromLunar(y,1,1),d,String(y))});
test('leap months: 2nd month 2023, 6th month 2025',()=>{const l23=C.lunarDate('2023-03-22');assert.deepEqual([l23.month,l23.leap,l23.day],[2,true,1]);const l25=C.lunarDate('2025-07-25');assert.deepEqual([l25.month,l25.leap,l25.day],[6,true,1])});
test('mid-autumn festival 2026 and the lunar date of today',()=>{assert.equal(C.fromLunar(2026,8,15),'2026-09-25');const t=C.lunarDate('2026-10-20');assert.equal(t.month,9);assert.ok(t.day>=9&&t.day<=11,String(t.day))});
test('2026 is the year of the Fire Horse; January 2026 still belongs to the Wood Snake',()=>{const a=C.lunarDate('2026-03-01');assert.equal(a.animal,'Pferd');assert.equal(a.element,'Feuer');const b=C.lunarDate('2026-01-15');assert.equal(b.animal,'Schlange');assert.equal(b.element,'Holz')});
test('full moon 26 Oct 2026 and new moon 9 Nov 2026 (UTC)',()=>{const ev=C.moonEvents(Date.UTC(2026,9,20),Date.UTC(2026,10,15));const full=ev.find(e=>e.type==='full'),nw=ev.find(e=>e.type==='new');assert.equal(new Date(full.ms).toISOString().slice(0,10),'2026-10-26');assert.equal(new Date(nw.ms).toISOString().slice(0,10),'2026-11-09')});
test('solar terms: 24 per year, solstices and equinoxes on the right days',()=>{const t=C.solarTerms(2026);assert.equal(t.length,24);const d=deg=>C.dateIn(t.find(x=>x.deg===deg).ms,0);assert.equal(d(0),'2026-03-20');assert.equal(d(90),'2026-06-21');assert.equal(d(180),'2026-09-23');assert.equal(d(270),'2026-12-21')});
test('festivals include Samhain, Yule and the Lantern Festival',()=>{const f=C.festivals(2026).map(x=>x.name+' '+x.date);assert.ok(f.includes('Samhain 2026-10-31'));assert.ok(f.some(x=>x.startsWith('Yule 2026-12-2')));assert.ok(f.includes('Laternenfest 2026-03-03'),f.join('|'))});

test('day pillar of the 60-day cycle',()=>{
 assert.equal(C.dayPillar('2000-01-01').name,'Wu-Wu');
 assert.equal(C.dayPillar('2000-01-01').animal,'Pferd');
 assert.equal(C.dayPillar('2000-03-01').index,(54+60)%60);
});
test('every library entry the calendar links to exists',()=>{
 const fs=require('node:fs'),path=require('node:path'),L=js('domain/content/library.js'),P=js('domain/cosmos/lore.js');
 const src=fs.readFileSync(path.join(__dirname,'../src/js/ui/cosmos.js'),'utf8');
 const ids=[...src.matchAll(/'(sinn-[a-z0-9-]+)'/g)].map(m=>m[1]).concat(P.PHASES.map(p=>p.lib));
 assert.ok(ids.length>15);for(const id of ids)assert.ok(L.get(id),id);
 assert.equal(P.PHASES.length,8);for(const t of C.TERMS)assert.ok(P.TERMS[t[0]],t[0]);
});
