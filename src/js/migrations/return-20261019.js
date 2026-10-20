// SOURCE: migrations/return-20261019.js
/* Dated handoff: user report and proposed training remain separate records. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('./context-830.js'),require('../state/schema.js'));else root.PulseReturnUpgrade=factory(root.PulseUpgrade,root.PulseState)})(globalThis,function(previous,state){
 function run(input,key){
  const db=previous.run(input,key),marker='return-2026-10-19-v1';
  if(key()<'2026-10-19'||db.imports.includes(marker))return db;
  db.imports.push(marker);return state.normalize(db);
 }
 return {run};
});


