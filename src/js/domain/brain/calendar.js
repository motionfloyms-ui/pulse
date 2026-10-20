// SOURCE: domain/brain/calendar.js
/* Calendar projections reuse the existing task, context and plan data. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../context/engine.js'));else root.PulseCalendar=factory(root.PulseContext)})(globalThis,function(context){
  function validDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T12:00:00');return !Number.isNaN(d.valueOf())&&context.localDay(d)===value}
  function monthDays(month){if(!/^\d{4}-\d{2}$/.test(month)||!validDate(month+'-01'))throw Error('Ungültiger Monat');const first=month+'-01',offset=(new Date(first+'T12:00:00').getDay()+6)%7;return Array.from({length:42},(_,i)=>context.offset(first,i-offset))}
  function shiftMonth(month,n){const d=new Date(month+'-01T12:00:00');d.setMonth(d.getMonth()+n);return context.localDay(d).slice(0,7)}
  function entries(db,date){
    const out=[];
    for(const task of context.entries(db))if(task.type==='task'&&task.record.due===date&&!['cancelled','superseded'].includes(task.record.status))out.push({token:task.key,kind:'task',title:task.text,time:task.record.time||'',completed:!!task.record.done,editable:true});
    for(const event of db.events||[])if(!(event.type==='measurement-plan'&&(db.body||[]).some(x=>x.date===date&&x.waist!=null))&&event.date===date&&['calendar-plan','measurement-plan'].includes(event.type)&&!['superseded','cancelled'].includes(event.status))out.push({token:'event:'+event.id,kind:'event',title:event.title||'Termin',time:event.time||'',completed:event.status==='completed',editable:event.status!=='completed'});
    const travel=context.trip(db,date);if(travel)out.push({kind:'travel',title:travel.title||'Reise',time:'',completed:false,editable:false});
    const training=context.training(db,date),sets=(db.workouts||[]).filter(w=>w.date===date);
    if(training||sets.length){const home=(db.events||[]).find(e=>e.type==='home-training-plan'&&e.date===date&&!['superseded','cancelled'].includes(e.status));const actual=sets.length>0;out.push({token:!actual&&training?.kind==='home'&&home?'event:'+home.id:null,kind:'training',title:actual?sets.length+' Trainingssätze erfasst':training.kind==='home'?'Heimtraining':(context.returnPolicy(db,date)?'Wiedereinstieg · Plan ':'Krafttraining · Plan ')+training.plan,completed:!!training?.completed,actual,editable:!actual&&training?.kind==='home'&&!training.completed&&!!home,time:''})}
    for(const m of db.body||[])if(m.date===date&&(m.waist!=null||m.weight!=null))out.push({kind:'measurement',title:m.waist!=null?'Taille: '+m.waist+' cm':'Gewicht: '+m.weight+' kg',completed:true,actual:true,editable:false,time:''});
    return out.sort((a,b)=>(a.time||'99:99').localeCompare(b.time||'99:99'));
  }
  return {validDate,monthDays,shiftMonth,entries};
});


