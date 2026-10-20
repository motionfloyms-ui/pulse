// SOURCE: domain/body/session.js
/* Read-only workout presentation: pending sets are never completed by navigation. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseSession=api})(globalThis,function(){
 function project(db,date,plan,exercises,preferred){
  const records=(db.workouts||[]).filter(x=>x.date===date&&x.plan===plan);
  const items=exercises.map((exercise,index)=>{
   const count=Number(String(exercise[1]).match(/^\d+/)?.[0]||3);
   const sets=records.filter(x=>x.exercise===exercise[0]);
   const pending=Array.from({length:count},(_,i)=>i).filter(i=>!sets.some(s=>s.set===i+1));
   return {index,name:exercise[0],count,sets,pending,done:pending.length===0};
  });
  const first=items.findIndex(x=>!x.done);
  const current=Number.isInteger(preferred)&&preferred>=0&&preferred<items.length?preferred:first<0?0:first;
  const effort=records.map(s=>s.rpe).filter(x=>Number.isFinite(x)&&x>0);
  return {items,current,records,allDone:items.length>0&&items.every(x=>x.done),
   closed:db.days?.[date]?.workout===plan&&records.length>0,
   exerciseCount:new Set(records.map(x=>x.exercise)).size,
   averageEffort:effort.length?Math.round(effort.reduce((a,b)=>a+b,0)/effort.length*10)/10:null,
   effortCount:effort.length};
 }
 function nextPending(session,after){
  for(let n=1;n<=session.items.length;n++){const i=(after+n)%session.items.length;if(!session.items[i].done)return i}
  return after;
 }
 return {project,nextPending};
});


