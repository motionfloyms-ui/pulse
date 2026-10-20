const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const R=js('domain/life/recur.js'),Life=js('domain/life/model.js');
const ev=(date,recur,extra={})=>({date,...R.normalize({date,recur,...extra})});
test('weekly, every two weeks, weekdays',()=>{
 const x=ev('2026-10-20',{freq:'weekly'});// Tuesday
 assert.deepEqual(R.starts(x,'2026-10-01','2026-11-10'),['2026-10-20','2026-10-27','2026-11-03','2026-11-10']);
 const y=ev('2026-10-19',{freq:'weekly',interval:2,byday:[1,3]});// Mon + Wed, every 2 weeks
 assert.deepEqual(R.starts(y,'2026-10-19','2026-11-08'),['2026-10-19','2026-10-21','2026-11-02','2026-11-04']);
 const w=ev('2026-10-23',{freq:'weekdays'});assert.deepEqual(R.starts(w,'2026-10-23','2026-10-27'),['2026-10-23','2026-10-26','2026-10-27']);
});
test('monthly by date and by nth weekday, yearly, until and count',()=>{
 const m=ev('2026-01-31',{freq:'monthly'});assert.deepEqual(R.starts(m,'2026-01-01','2026-05-31'),['2026-01-31','2026-03-31','2026-05-31'],'months without day 31 are skipped');
 const n=ev('2026-10-13',{freq:'monthlyNth'});// 2nd Tuesday
 assert.deepEqual(R.starts(n,'2026-10-01','2027-01-31'),['2026-10-13','2026-11-10','2026-12-08','2027-01-12']);
 const last=ev('2026-10-30',{freq:'monthlyNth',nth:-1});// last Friday
 assert.deepEqual(R.starts(last,'2026-10-01','2026-12-31'),['2026-10-30','2026-11-27','2026-12-25']);
 const b=ev('2024-02-29',{freq:'yearly'});assert.deepEqual(R.starts(b,'2024-01-01','2028-12-31'),['2024-02-29','2028-02-29']);
 const u=ev('2026-10-20',{freq:'daily',until:'2026-10-22'});assert.deepEqual(R.starts(u,'2026-10-01','2026-12-31'),['2026-10-20','2026-10-21','2026-10-22']);
 const c=ev('2026-10-20',{freq:'daily',interval:2,count:3});assert.deepEqual(R.starts(c,'2026-10-01','2026-12-31'),['2026-10-20','2026-10-22','2026-10-24']);
});
test('skipped dates and multi-day spans',()=>{
 const x=ev('2026-10-20',{freq:'weekly'},{exdates:['2026-10-27']});assert.equal(R.occursOn(x,'2026-10-27'),false);assert.equal(R.occursOn(x,'2026-11-03'),true);
 const trip=ev('2026-12-28',null,{endDate:'2027-01-02'});assert.equal(R.occurrence(trip,'2027-01-01').day,5);assert.equal(R.occursOn(trip,'2027-01-03'),false);
 assert.throws(()=>R.normalize({date:'2026-10-20',endDate:'2026-10-19'}),/vor dem Beginn/);
});
test('German descriptions',()=>{
 assert.equal(R.describe(ev('2026-10-20',{freq:'weekly'})),'Jeden Dienstag');
 assert.equal(R.describe(ev('2026-10-19',{freq:'weekly',interval:2,byday:[3,1]})),'Alle 2 Wochen am Mo, Mi');
 assert.equal(R.describe(ev('2026-10-13',{freq:'monthlyNth',until:'2027-06-30'})),'Monatlich am 2. Dienstag, bis 30. Juni 2027');
 assert.equal(R.describe(ev('2026-10-21',{freq:'yearly'})),'Jährlich am 21. Oktober');
});
test('the day view shows repeating and multi-day events',()=>{
 const db={life:{version:1,items:[],preferences:{}}};
 Life.create(db,{kind:'event',title:'Bandprobe',date:'2026-10-20',time:'19:00',recur:{freq:'weekly'},location:'Proberaum'},'e1','t');
 Life.create(db,{kind:'event',title:'Urlaub',date:'2026-10-29',endDate:'2026-10-31'},'e2','t');
 Life.create(db,{kind:'task',title:'Aufgabe',date:'2026-10-27'},'t1','t');
 const d=Life.day(db,'2026-10-27');assert.deepEqual(d.map(x=>x.title).sort(),['Aufgabe','Bandprobe']);
 assert.equal(d.find(x=>x.title==='Bandprobe').seriesDate,'2026-10-20');
 assert.equal(Life.day(db,'2026-10-30')[0].occ.day,2);
 assert.equal(Life.get(db,'e1').location,'Proberaum');
 Life.update(db,'e1',{exdates:['2026-11-03']},'t');assert.equal(Life.day(db,'2026-11-03').length,0);
});
