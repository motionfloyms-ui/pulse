const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const I=js('domain/life/ics.js'),R=js('domain/life/recur.js'),Life=js('domain/life/model.js');
const GOOGLE=`BEGIN:VCALENDAR\r
PRODID:-//Google Inc//Google Calendar 70.9054//EN\r
VERSION:2.0\r
BEGIN:VTIMEZONE\r
TZID:Europe/Berlin\r
BEGIN:STANDARD\r
DTSTART:19701025T030000\r
END:STANDARD\r
END:VTIMEZONE\r
BEGIN:VEVENT\r
DTSTART;TZID=Europe/Berlin:20261020T190000\r
DTEND;TZID=Europe/Berlin:20261020T213000\r
RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20261231T225959Z\r
EXDATE;TZID=Europe/Berlin:20261103T190000\r
UID:band@google.com\r
SUMMARY:Bandprobe\\, laut\r
LOCATION:Proberaum\\, Wuppertal\r
DESCRIPTION:Mitbringen:\\nMikro\r
BEGIN:VALARM\r
ACTION:DISPLAY\r
TRIGGER:-P0DT0H30M0S\r
END:VALARM\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART;TZID=Europe/Berlin:20261110T200000\r
DTEND;TZID=Europe/Berlin:20261110T220000\r
RECURRENCE-ID;TZID=Europe/Berlin:20261110T190000\r
UID:band@google.com\r
SUMMARY:Bandprobe (später)\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART:20261025T080000Z\r
DTEND:20261025T090000Z\r
UID:utc@google.com\r
SUMMARY:Nach Zeitumstellung\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART;VALUE=DATE:20261228\r
DTEND;VALUE=DATE:20270103\r
UID:urlaub@google.com\r
SUMMARY:Urlaub\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART;VALUE=DATE:19820517\r
DTEND;VALUE=DATE:19820518\r
RRULE:FREQ=YEARLY\r
UID:bday@google.com\r
SUMMARY:Geburtstag Mama\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART;TZID=America/New_York:20261021T090000\r
DTEND;TZID=America/New_York:20261021T100000\r
UID:ny@google.com\r
SUMMARY:Call New York\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART;TZID=Europe/Berlin:20261013T180000\r
DTEND;TZID=Europe/Berlin:20261013T190000\r
RRULE:FREQ=MONTHLY;BYDAY=2TU\r
UID:nth@google.com\r
SUMMARY:Stammtisch\r
END:VEVENT\r
BEGIN:VEVENT\r
DTSTART;TZID=Europe/Berlin:20261012T080000\r
DTEND;TZID=Europe/Berlin:20261012T083000\r
RRULE:FREQ=WEEKLY;BYDAY=MO,TU,WE,TH,FR\r
UID:wd@google.com\r
SUMMARY:Pendeln\r
END:VEVENT\r
END:VCALENDAR\r
`;
test('imports a Google Calendar export',()=>{
 const {events,simplified,skipped}=I.parse(GOOGLE,{target:'Europe/Berlin'});
 assert.equal(skipped,0);assert.equal(simplified,0);
 const by=t=>events.find(e=>e.title===t);
 const band=by('Bandprobe, laut');
 assert.deepEqual([band.date,band.time,band.duration,band.location,band.body,band.remind],['2026-10-20','19:00',150,'Proberaum, Wuppertal','Mitbringen:\nMikro',30]);
 assert.deepEqual(band.recur,{freq:'weekly',interval:1,byday:[2],until:'2026-12-31',count:0});
 assert.deepEqual(band.exdates.sort(),['2026-11-03','2026-11-10'],'the moved instance is skipped in the series');
 assert.equal(by('Bandprobe (später)').time,'20:00');
 assert.equal(by('Nach Zeitumstellung').time,'09:00','UTC 08:00 is 09:00 in winter time');
 assert.deepEqual([by('Urlaub').date,by('Urlaub').endDate,by('Urlaub').time],['2026-12-28','2027-01-02','']);
 assert.equal(by('Call New York').time,'15:00');
 assert.equal(by('Stammtisch').recur.freq,'monthlyNth');assert.equal(by('Stammtisch').recur.nth,2);
 assert.equal(by('Pendeln').recur.freq,'weekdays');
 // as PulseLife items
 const db={life:{version:1,items:[],preferences:{}}};events.forEach((e,i)=>Life.create(db,e,'i'+i,'t'));
 assert.deepEqual(Life.day(db,'2026-10-27').map(x=>x.title),['Pendeln','Bandprobe, laut']);
 assert.equal(Life.day(db,'2026-11-03').some(x=>x.title.startsWith('Bandprobe')),false);
 assert.deepEqual(Life.day(db,'2026-11-10').filter(x=>x.title.startsWith('Bandprobe')).map(x=>x.title),['Bandprobe (später)']);
 assert.equal(Life.day(db,'2027-05-17').map(x=>x.title).includes('Geburtstag Mama'),true);
 assert.equal(Life.day(db,'2026-11-10').some(x=>x.title==='Stammtisch'),true);
});
test('export and re-import keep the essentials',()=>{
 const {events}=I.parse(GOOGLE,{target:'Europe/Berlin'});
 const items=events.map((e,i)=>({id:'x'+i,...e,...R.normalize(e)}));
 const text=I.build(items,{tz:'Europe/Berlin',now:'2026-10-21T10:00:00.000Z'});
 assert.match(text,/RRULE:FREQ=WEEKLY;BYDAY=TU;UNTIL=20261231T235959/);
 assert.match(text,/DTSTART;VALUE=DATE:20261228\r\nDTEND;VALUE=DATE:20270103/);
 const again=I.parse(text,{target:'Europe/Berlin'}).events;
 assert.equal(again.length,events.length);
 const band=again.find(e=>e.title==='Bandprobe, laut');assert.deepEqual([band.time,band.duration,band.remind,band.location],['19:00',150,30,'Proberaum, Wuppertal']);
 assert.equal(again.find(e=>e.title==='Stammtisch').recur.nth,2);
});
