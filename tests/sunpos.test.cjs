const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const P=js('domain/cosmos/sunpos.js'),A=js('domain/cosmos/astro.js');
const max=(day)=>{let best={alt:-99};for(let m=0;m<1440;m+=2){const s=P.sun(Date.parse(day+'T00:00:00Z')+m*60000);if(s.alt>best.alt)best=s}return best};
test('the sun at noon in Wuppertal: high in June, low in December, south',()=>{
 const june=max('2026-06-21'),dec=max('2026-12-21'),mar=max('2026-03-20');
 assert.ok(Math.abs(june.alt-62.2)<0.3,june.alt);assert.ok(Math.abs(dec.alt-15.3)<0.3,dec.alt);assert.ok(Math.abs(mar.alt-38.7)<0.6,mar.alt);
 assert.ok(Math.abs(june.az-180)<2,june.az);
});
test('sunrise from the calendar has the sun just below the horizon, in the east',()=>{
 for(const day of ['2026-03-20','2026-06-21','2026-10-23','2026-12-21']){const t=A.sunTimes(day),r=P.sun(t.rise),s=P.sun(t.set);
  assert.ok(Math.abs(r.alt+0.83)<0.35,day+' rise '+r.alt);assert.ok(Math.abs(s.alt+0.83)<0.35,day+' set '+s.alt);assert.ok(r.az>40&&r.az<135,day+' az '+r.az);assert.ok(s.az>225&&s.az<320,day+' az '+s.az)}
});
test('the moon agrees with the calendar\'s more exact moon to within half a degree',()=>{
 for(const iso of ['2026-01-03T05:00:00Z','2026-05-17T20:00:00Z','2026-10-23T18:00:00Z','2027-02-11T02:30:00Z']){const ms=Date.parse(iso),a=P.moon(ms).lon,b=A.moonLongitude(ms),d=Math.abs(((a-b+540)%360)-180);assert.ok(d<0.5,iso+' '+d)}
 const m=P.moon(Date.parse('2026-10-23T18:00:00Z'));assert.ok(m.alt>-90&&m.alt<90&&m.az>=0&&m.az<360);
});
test('vectors: north is +x, east +z, up +y',()=>{
 const r=v=>v.map(x=>Math.round(x*1000)/1000+0);assert.deepEqual(r(P.vector(0,0)),[1,0,0]);assert.deepEqual(r(P.vector(0,90)),[0,0,1]);assert.deepEqual(r(P.vector(90,123)),[0,1,0]);
});
