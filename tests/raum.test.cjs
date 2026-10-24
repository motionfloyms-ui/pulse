const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const H=js('domain/raum/hub.js'),L=js('domain/life/model.js');
const near=(a,b,e=1e-9)=>Math.abs(a-b)<e;
/* Where the head is in the world for a given rig and a head position inside the tracked space. */
const world=(rig,local)=>{const w=H.turn(local.x,local.z,rig.yaw);return {x:rig.x+w.x,z:rig.z+w.z,yaw:H.wrapAngle(rig.yaw+local.yaw)}};
test('moving the rig puts the head exactly on the spot and turns it the right way',()=>{
 for(const [rig,local,target] of [
  [{x:0,z:0,yaw:0},{x:.4,z:-.3,yaw:.2},{x:-1.1,z:1.7,yaw:2.6}],
  [{x:1.2,z:-.5,yaw:-1.3},{x:-.25,z:.6,yaw:3},{x:0,z:0,yaw:0}],
  [{x:-2,z:2,yaw:3.1},{x:0,z:0,yaw:-3.1},{x:.5,z:.5,yaw:-.7}]]){
  const head=world(rig,local),next=H.rigFor(rig,head,target),after=world(next,local);
  assert.ok(near(after.x,target.x)&&near(after.z,target.z),'position');assert.ok(near(H.wrapAngle(after.yaw-target.yaw),0),'direction');
 }
});
test('a snap turn turns around the head, not around the middle of the room',()=>{
 const rig={x:.3,z:-.2,yaw:.4},local={x:.5,z:.5,yaw:0},head=world(rig,local),next=H.rigFor(rig,head,{x:head.x,z:head.z,yaw:head.yaw-Math.PI/6}),after=world(next,local);
 assert.ok(near(after.x,head.x)&&near(after.z,head.z));assert.ok(near(H.wrapAngle(after.yaw-head.yaw),-Math.PI/6));
});
test('standing in front of a station: closer to the middle, looking at it',()=>{
 const s=H.approach(-1.3,2.08,1),r=Math.hypot(-1.3,2.08);
 assert.ok(near(Math.hypot(s.x,s.z),r-1,1e-9));
 const look={x:-Math.sin(s.yaw),z:-Math.cos(s.yaw)},to={x:(-1.3-s.x),z:(2.08-s.z)};
 assert.ok(near(look.x*to.z-look.z*to.x,0,1e-9)&&look.x*to.x+look.z*to.z>0,'faces the station');
 assert.deepEqual(H.approach(0,0,.5),{x:0,z:.5,yaw:0});
});
test('day board: appointments marked past, now, next; tasks open first, overdue last, parked never',()=>{
 const db={},T='2026-10-24T08:00:00.000Z',day='2026-10-24';
 L.create(db,{kind:'event',title:'Probe',date:day,time:'09:00',duration:60},'e1',T);
 L.create(db,{kind:'event',title:'Zahnarzt',date:day,time:'14:00',duration:30},'e2',T);
 L.create(db,{kind:'event',title:'Atelier',date:day,time:'12:30',duration:60},'e3',T);
 L.create(db,{kind:'event',title:'Geburtstag',date:day},'e4',T);
 L.create(db,{kind:'task',title:'Altglas',date:day},'t1',T);
 L.create(db,{kind:'task',title:'Text lesen',date:day,status:'done'},'t2',T);
 L.create(db,{kind:'ritual',title:'Kerze',date:day},'r1',T);
 L.create(db,{kind:'task',title:'Steuer',date:'2026-10-20'},'t3',T);
 L.create(db,{kind:'task',title:'Geparkt',date:'2026-10-19',status:'parked'},'t4',T);
 L.create(db,{kind:'task',title:'Frist',deadline:'2026-10-22'},'t5',T);
 const b=H.dayBoard({day:L.day(db,day),all:L.list(db),date:day,hm:'13:00'});
 assert.deepEqual(b.events.map(e=>[e.title,e.state]),[['Geburtstag','day'],['Probe','past'],['Atelier','now'],['Zahnarzt','next']]);
 assert.equal(b.next.title,'Zahnarzt');assert.equal(b.next.inMin,60);assert.equal(b.events[2].end,'13:30');
 assert.deepEqual(b.tasks.map(t=>[t.title,t.done,t.overdue]),[['Altglas',false,false],['Kerze',false,false],['Text lesen',true,false],['Steuer',false,true],['Frist',false,true]]);
 assert.deepEqual([b.done,b.total,b.moreLate],[1,2,0],'rituals do not count as tasks');
 assert.equal(H.dayBoard({day:[],all:[],date:day}).next,null);
 assert.deepEqual([H.inWords(.5),H.inWords(25),H.inWords(60),H.inWords(210)],['gleich','in 25 Min.','in 1 Std.','in 3½ Std.']);
});
test('bowl: a quick touch from outside strikes, a slow one or one from inside does not',()=>{
 const above={x:0,y:.05,z:0},inside={x:0,y:-.03,z:0},side={x:.2,y:-.03,z:0},wall={x:.1,y:-.03,z:0};
 assert.ok(H.inBowl(inside)&&H.inBowl(wall)&&!H.inBowl(above)&&!H.inBowl(side));
 const hard=H.strike(above,inside,1/72),soft=H.strike(above,inside,1/2);
 assert.ok(hard>.5&&hard<=1,'hard '+hard);assert.equal(soft,0,'too slow');
 assert.equal(H.strike(inside,wall,1/72),0,'already touching');
 assert.ok(H.strike(side,wall,1/72)>0,'from the side');
});
test('bowl: circling the rim gives the angular speed, the singing starts above one slow turn',()=>{
 const r=H.BOWL.rim,at=a=>({x:Math.cos(a)*r,y:.005,z:Math.sin(a)*r});
 assert.ok(near(H.rimSpeed(at(0),at(.1),.05),2,1e-9));assert.ok(near(H.rimSpeed(at(3.1),at(-3.1),.1),(2*Math.PI-6.2)/.1,1e-9),'across ±π');
 assert.equal(H.rimSpeed(at(0),{x:0,y:0,z:0},.05),0);
 assert.equal(H.singTarget(.8),0);assert.ok(H.singTarget(3)>0&&H.singTarget(3)<1);assert.equal(H.singTarget(-9),1);
 assert.equal(H.BOWL.partials[0][0],1);assert.ok(H.BOWL.partials.every((p,i,a)=>!i||p[0]>a[i-1][0]&&p[2]<a[i-1][2]),'higher partials die away sooner');
});
