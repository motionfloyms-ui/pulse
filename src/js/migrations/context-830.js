// SOURCE: migrations/context-830.js
/* Additive user-supplied plans, never completed events or medication recommendations. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./legacy-820.js'),require('../state/schema.js'));else root.PulseUpgrade=factory(root.PulseMigrations,root.PulseState)})(globalThis,function(legacy,state){
 function run(input,key){const db=legacy.run(input,key),marker='coaching-context-2026-10-05-v1';if(db.imports.includes(marker))return db;
  const add=e=>{if(!db.events.some(x=>x.id===e.id))db.events.push({source:'user-handoff-2026-10-05',confidence:'user-reported',recordedAt:'2026-10-05',status:'planned',...e})};
  // Scope a legacy global capacity choice to the migration day. Do not erase records.
  if(['normal','low','recovery'].includes(db.settings.dayMode)){const day=db.days[key()]||(db.days[key()]={});if(!day.dayMode)day.dayMode=db.settings.dayMode;db.settings.dayMode='auto'}
  db.imports.push(marker);return state.normalize(db);
 }
 return {run};
});


