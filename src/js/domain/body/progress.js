// SOURCE: domain/body/progress.js
/* Recorded coverage is explicit. Unknown daily values never become zero scores. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseProgress=api})(globalThis,function(){
  function week(db,date,offset,score){
    const days=Array.from({length:7},(_,index)=>{
      const key=offset(date,index-6),d=db.days[key]||{};
      const nutrition=Number(d.meals)>0||Number(d.kcal)>0||Number(d.protein)>0;
      return {date:key,kcal:nutrition?d.kcal??null:null,protein:nutrition?d.protein??null:null,
        water:d.water>0?d.water:null,steps:d.steps>0||d.stepsRecordedAt?d.steps??0:null,
        sleep:d.recovery?.sleep??null,readiness:score(d.recovery)};
    });
    const averages={};
    for(const field of ['kcal','protein','water','steps','readiness']){
      const values=days.map(day=>day[field]).filter(Number.isFinite);
      averages[field]={count:values.length,value:values.length?Math.round(values.reduce((sum,x)=>sum+x,0)/values.length*10)/10:null};
    }
    return {days,averages};
  }
  return {week};
});


