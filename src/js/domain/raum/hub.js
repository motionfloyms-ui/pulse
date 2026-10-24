// SOURCE: domain/raum/hub.js
/* Himmelsraum as a hub: the arithmetic behind it, without three.js and without the page.
   - Moving in VR: where the rig has to go so that the head ends up at a spot, looking a given way.
   - The day board: today's appointments and tasks, ordered and marked (past, now, next, overdue).
   - The singing bowl: its partials, when a fingertip or controller strikes it, how fast it circles the rim.
   Angles are yaw in radians around +y as in three.js: yaw 0 looks along -z, positive turns left. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseRaum=api})(globalThis,function(){
 'use strict';
 const TAU=Math.PI*2,clamp=(x,a,b)=>Math.max(a,Math.min(b,x));
 /* A point turned around +y by `a` (three.js convention). */
 const turn=(x,z,a)=>({x:Math.cos(a)*x+Math.sin(a)*z,z:-Math.sin(a)*x+Math.cos(a)*z});
 const wrapAngle=a=>Math.atan2(Math.sin(a),Math.cos(a));
 /* The yaw of a horizontal direction (dx, dz). */
 const yawOf=(dx,dz)=>Math.atan2(-dx,-dz);
 /* rig {x,z,yaw}: the room's frame for the tracked space. head {x,z,yaw}: where the head is in the world now.
    Returns the rig that puts the head at target {x,z}, looking along target.yaw. Height stays real. */
 function rigFor(rig,head,target){
  const local=turn(head.x-rig.x,head.z-rig.z,-rig.yaw),yaw=wrapAngle(rig.yaw+wrapAngle(target.yaw-head.yaw)),w=turn(local.x,local.z,yaw);
  return {x:target.x-w.x,z:target.z-w.z,yaw};
 }
 /* Where to stand in front of something at (x, z): `dist` metres from it towards the middle of the room,
    looking at it. Things in the middle are approached from the front (-z side). */
 function approach(x,z,dist){
  const r=Math.hypot(x,z);if(r<1e-6)return {x,z:z+dist,yaw:0};
  const tx=x-x/r*dist,tz=z-z/r*dist;return {x:tx,z:tz,yaw:yawOf(x-tx,z-tz)};
 }
 /* ---------- Day board ---------- */
 const toMin=hm=>{const m=/^(\d{1,2}):(\d{2})$/.exec(String(hm||''));return m?Number(m[1])*60+Number(m[2]):null};
 const toHM=min=>{const m=((Math.round(min)%1440)+1440)%1440;return String(Math.floor(m/60)).padStart(2,'0')+':'+String(m%60).padStart(2,'0')};
 /* day: the items of the day (PulseLife.day), all: every item (PulseLife.list), date 'YYYY-MM-DD', hm 'HH:MM' (now). */
 function dayBoard({day=[],all=[],date,hm='00:00',overdueMax=3}={}){
  const now=toMin(hm)??0,events=[],tasks=[];let next=null;
  for(const x of day){
   if(x.kind==='event'){
    const start=toMin(x.time),end=start==null?null:start+(Number(x.duration)||60),e={id:x.id,title:x.title,time:x.time||'',end:start==null?'':toHM(Math.min(end,1439)),allDay:start==null,state:'later',inMin:0};
    if(e.allDay)e.state='day';else if(end<=now)e.state='past';else if(start<=now)e.state='now';else{e.inMin=start-now;if(!next){next=e;e.state='next'}}
    events.push(e);
   }else if(x.kind==='task'||x.kind==='ritual')tasks.push({id:x.id,title:x.title,time:x.time||'',done:x.status==='done',ritual:x.kind==='ritual',overdue:false,date:x.date||date});
  }
  events.sort((a,b)=>(a.allDay?-1:0)-(b.allDay?-1:0)||a.time.localeCompare(b.time));
  const ids=new Set(tasks.map(t=>t.id)),late=[];
  for(const x of all){
   if(x.kind!=='task'||ids.has(x.id)||['done','parked','archived'].includes(x.status))continue;
   if((x.date&&x.date<date)||(x.deadline&&x.deadline<date))late.push({id:x.id,title:x.title,time:'',done:false,ritual:false,overdue:true,date:x.date||x.deadline});
  }
  late.sort((a,b)=>String(a.date).localeCompare(String(b.date)));
  const open=tasks.filter(t=>!t.done),done=tasks.filter(t=>t.done),todo=tasks.filter(t=>!t.ritual);
  return {events,tasks:[...open,...done,...late.slice(0,overdueMax)],moreLate:Math.max(0,late.length-overdueMax),done:todo.filter(t=>t.done).length,total:todo.length,next};
 }
 /* "in 25 Min.", "in 2 Std.", "in 3½ Std." */
 function inWords(min){if(min<1)return 'gleich';if(min<60)return 'in '+Math.round(min)+' Min.';const h=min/60,half=Math.round(h*2)/2;return 'in '+String(Math.floor(half))+(half%1?'½':'')+' Std.'}
 /* ---------- Singing bowl ---------- */
 /* Partials of a hand-hammered bowl: ratio to the fundamental, level, seconds until -60 dB, beating in Hz
    (each mode is split in two close frequencies, which gives the slow wah-wah). */
 const BOWL={f1:220,rim:.11,depth:.075,partials:[[1,1,16,.85],[2.71,.5,9,1.5],[5.12,.28,5,2.3],[8.16,.14,3.2,3.2],[11.7,.06,2,4.4]]};
 /* p: a point relative to the centre of the rim (metres, y up). True when it touches the bowl (body or hollow). */
 function inBowl(p,{rim=BOWL.rim,depth=BOWL.depth,skin=.012}={}){
  const rs=(rim*rim+depth*depth)/(2*depth),cy=rs-depth;
  return p.y<=skin&&p.y>=-depth-skin&&Math.hypot(p.x,p.y-cy,p.z)<=rs+skin;
 }
 /* A strike: the tip was outside a moment ago and is inside now, moving fast enough. Returns 0..1 (0 = no strike). */
 function strike(prev,cur,dt,opts){
  if(!prev||!cur||!(dt>0)||inBowl(prev,opts)||!inBowl(cur,opts))return 0;
  const v=Math.hypot(cur.x-prev.x,cur.y-prev.y,cur.z-prev.z)/dt;
  return v<.22?0:clamp((v-.15)/1.6,.06,1);
 }
 /* Near the rim, where circling makes the bowl sing. */
 function onRim(p,{rim=BOWL.rim}={}){return Math.abs(Math.hypot(p.x,p.z)-rim)<.028&&Math.abs(p.y)<.03}
 /* Angular speed (rad/s) around the rim between two points; 0 when one of them is not on the rim. */
 function rimSpeed(prev,cur,dt,opts){
  if(!prev||!cur||!(dt>0)||!onRim(prev,opts)||!onRim(cur,opts))return 0;
  return wrapAngle(Math.atan2(cur.z,cur.x)-Math.atan2(prev.z,prev.x))/dt;
 }
 /* How loud the singing should become for a given angular speed: nothing below one turn in six seconds. */
 const singTarget=w=>clamp((Math.abs(w)-1)/4.5,0,1);
 return {TAU,turn,wrapAngle,yawOf,rigFor,approach,toMin,toHM,dayBoard,inWords,BOWL,inBowl,strike,onRim,rimSpeed,singTarget};
});
