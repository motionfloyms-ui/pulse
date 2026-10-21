const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const C=js('domain/brain/parser.js'),Ctx=js('domain/context/engine.js');const off=Ctx.offset,T='2026-10-20';
const type=t=>C.interpret(t,T,off).type;
test('tasks with future words',()=>{assert.equal(type('Morgen Katzenfutter kaufen'),'task');assert.equal(C.interpret('Morgen Katzenfutter kaufen',T,off).due,'2026-10-21')});
test('food, drink and workout',()=>{assert.equal(type('150 g Skyr gegessen'),'food');assert.equal(type('250 ml Wasser getrunken'),'drink');assert.equal(type('Latzug 30 kg 10 wdh'),'workout')});
test('shopping with kilos is not a workout',()=>assert.notEqual(type('2 kg Kartoffeln gekauft'),'workout'));
test('recovery and clearing context',()=>{assert.equal(type('Heute starke Schmerzen'),'recovery');assert.equal(type('mir geht es wieder gut'),'context-clear')});
test('workout parser understands spoken numbers',()=>{assert.deepEqual(C.workout('Beinpresse vierzig kilo zwölf Wiederholungen'),{exercise:'Beinpresse (07)',kg:40,reps:12});assert.deepEqual(C.workout('Latzug zweiunddreißig komma fünf kilo neun wdh'),{exercise:'Latzug (05)',kg:32.5,reps:9});assert.equal(C.workout('Glute Drive 40,5 kg 10 reps').kg,40.5)});
const W=t=>C.when(t,T,off);
test('when: relative days and clock times',()=>{assert.deepEqual(W('Zahnarzt morgen um 15 Uhr'),{date:'2026-10-21',time:'15:00',end:''});assert.deepEqual(W('übermorgen 9:30'),{date:'2026-10-22',time:'09:30',end:''})});
test('when: weekday means the next one, never today',()=>{assert.equal(W('Freitag anrufen').date,'2026-10-23');assert.equal(W('Dienstag Probe').date,'2026-10-27')});
test('when: past day without year rolls into next year',()=>{assert.equal(W('am 24.10.').date,'2026-10-24');assert.equal(W('am 3.1.').date,'2027-01-03')});
test('when: invalid dates and plain text stay empty',()=>{assert.deepEqual(W('am 31.2.'),{date:'',time:'',end:''});assert.deepEqual(W('Wäsche waschen'),{date:'',time:'',end:''})});
test('when: month names, spans, evening',()=>{
 assert.equal(W('Konzert 3. Mai').date,'2027-05-03');assert.equal(W('am 24. Dez.').date,'2026-12-24');assert.equal(W('1. März 2027').date,'2027-03-01');
 assert.deepEqual(W('Probe 19–21 Uhr'),{date:'',time:'19:00',end:'21:00'});assert.deepEqual(W('von 10 bis 12'),{date:'',time:'10:00',end:'12:00'});
 assert.equal(W('7 Uhr abends').time,'19:00');assert.equal(W('Treffen 19.30 Uhr').time,'19:30');
 assert.equal(W('2-3 kg Kartoffeln').time,'');assert.equal(W('Probe 19 Uhr bis 20.12.').end,'');
});
const Rc=require('../src/js/domain/life/recur.js'),P=s=>C.repeat(s);
const series=s=>{const r=C.repeat(s);if(!r)return null;const w=C.when(r.rest,T,off),p=Rc.place(r.rule,w.date||T);return {...p,time:w.time,end:w.end,title:C.strip(r.rest)}};
test('series: weekly, several days, every other week',()=>{
 assert.deepEqual(series('Probe jeden Dienstag 19 Uhr'),{date:'2026-10-20',recur:{freq:'weekly',interval:1,until:'',count:0,byday:[2]},time:'19:00',end:'',title:'Probe'});
 assert.deepEqual(series('dienstags und donnerstags Yoga 18 Uhr').recur.byday,[2,4]);
 assert.deepEqual(series('Training montags, mittwochs und freitags').recur.byday,[1,3,5]);
 assert.deepEqual(series('jeden Di und Do 7 Uhr Laufen').recur.byday,[2,4]);
 assert.deepEqual(series('Probe jeden Dienstag und jeden Donnerstag 19 Uhr').title,'Probe');
 const g=series('Gesang alle 2 Wochen am Donnerstag 17:30–18:30');assert.deepEqual([g.date,g.recur.interval,g.recur.byday,g.time,g.end,g.title],['2026-10-22',2,[4],'17:30','18:30','Gesang']);
 assert.deepEqual(series('Plenum jeden zweiten Dienstag').recur,{freq:'weekly',interval:2,until:'',count:0,byday:[2]});
 assert.equal(series('werktags Standup 9:15').recur.freq,'weekdays');
});
test('series: days, months, years',()=>{
 assert.deepEqual(series('Gießen jeden 2. Tag').recur,{freq:'daily',interval:2,until:'',count:0});
 const s=series('Stammtisch jeden dritten Donnerstag im Monat 20 Uhr');assert.deepEqual([s.date,s.recur.freq,s.recur.nth],['2026-11-19','monthlyNth',3]);
 const l=series('Bandtreffen jeden letzten Freitag im Monat');assert.deepEqual([l.date,l.recur.nth],['2026-10-30',-1]);
 assert.equal(series('Miete monatlich am 1.').date,'2026-11-01');assert.equal(series('Treffen jeden 15. 18 Uhr').date,'2026-11-15');
 assert.deepEqual(series('Friseur alle zwei Monate').recur,{freq:'monthly',interval:2,until:'',count:0});
 const y=series('Mama Geburtstag jährlich am 3. Mai');assert.deepEqual([y.date,y.recur.freq,y.time,y.title],['2027-05-03','yearly','','Mama Geburtstag']);
});
test('series: how long it runs',()=>{
 assert.equal(series('Vitamin D täglich 8 Uhr bis 20.12.').recur.until,'2026-12-20');
 assert.equal(series('Probe dienstags bis Ende Dezember').recur.until,'2026-12-31');
 const k=series('Kurs jeden Mittwoch ab 4.11. für 6 Wochen 18 Uhr');assert.deepEqual([k.date,k.recur.until,k.title],['2026-11-04','2026-12-09','Kurs']);
 assert.equal(series('Lesen jeden Tag 10-mal').recur.count,10);assert.equal(series('2x täglich Zähne putzen').recur.count,0);assert.equal(series('Kurs dienstags 8 Termine').recur.count,8);
});
test('series: ordinary sentences stay single entries',()=>{
 for(const t of ['Zahnarzt Freitag 15 Uhr','Das ist immer so','Physio 2x pro Woche','Wöchentlicher Rückblick','Tägliche Routine notieren','so und so','Treffen am 15.','Dienstag Probe','Freitags-Playlist','Montags-Blues hören'])assert.equal(P(t),null,t);
});
test('titles lose date, time and reminder words',()=>{
 assert.equal(C.strip('Zahnarzt morgen um 15 Uhr'),'Zahnarzt');assert.equal(C.strip('Mama anrufen übermorgen'),'Mama anrufen');
 assert.equal(C.strip('Konzert am 3. Mai 20 Uhr'),'Konzert');assert.equal(C.strip('Kino heute Abend 20 Uhr'),'Kino');
 assert.equal(C.strip('2-3 Stück Kuchen morgen'),'2-3 Stück Kuchen');assert.equal(C.strip('morgen 15 Uhr'),'morgen 15 Uhr');
 assert.equal(C.strip('Brunch 10 Uhr, Erinnerung 1 Stunde vorher'),'Brunch');assert.equal(C.strip('Probe um 19:00 Uhr'),'Probe');assert.equal(C.strip('Zahnarzt am Freitag, 23.10. um 15 Uhr'),'Zahnarzt');assert.equal(C.strip('Altglas wegbringen morgen'),'Altglas wegbringen');
});
test('reminder wishes',()=>{
 assert.equal(C.remind('Zahnarzt 30 min vorher'),30);assert.equal(C.remind('Erinnerung 1 Stunde vorher'),60);assert.equal(C.remind('eine Stunde vorher'),60);
 assert.equal(C.remind('am Vortag erinnern'),1440);assert.equal(C.remind('Probe mit Erinnerung'),'default');assert.equal(C.remind('Zahnarzt'),null);
});
test('a date is a look back only with a past year or past tense',()=>{
 assert.notEqual(type('Zahnarzt am 23.10. 15 Uhr'),'historical-review');assert.notEqual(type('Mama Geburtstag jährlich am 3. Mai'),'historical-review');
 assert.equal(type('Am 3.10. war ich beim Arzt'),'historical-review');assert.equal(type('am 3.5.2025 Konzert'),'historical-review');assert.equal(type('gestern Konzert'),'historical-review');
});
