// SOURCE: storage/local-store.js
/* Synchronous compatibility adapter. The only module accessing browser storage. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseStorage=api})(globalThis,function(){
 'use strict';
 function fault(code,message,cause){const e=new Error(message);e.code=code;e.cause=cause;return e}
 function create({getStorage,state,migrate,key='pulseOS'}){
  let storage=null,expected=null,original=null,loaded=false,lastError=null;
  function read(){try{return storage.getItem(key)}catch(e){throw fault('READ_FAILED','PULSE kann die gespeicherten Daten gerade nicht lesen.',e)}}
  function assertUnchanged(){if(read()!==expected)throw fault('CONFLICT','Der gespeicherte Stand wurde in einem anderen Fenster geändert. Exportiere deine offenen Änderungen und lade PULSE neu.')}
  function write(name,bytes){try{storage.setItem(name,bytes)}catch(e){throw fault('WRITE_FAILED','PULSE konnte nicht speichern. Deine offenen Änderungen bleiben in diesem Fenster; bitte exportiere sie.',e)}}
  function transact(value,backupKey){
   const prepared=state.normalize(value),bytes=JSON.stringify(prepared);
   assertUnchanged();
   if(backupKey&&expected!==null)write(backupKey,expected);
   assertUnchanged();
   write(key,bytes);expected=bytes;lastError=null;return prepared;
  }
  function attempt(fn){try{return fn()}catch(e){lastError=e;throw e}}
  function load(){return attempt(()=>{
   if(loaded)throw fault('ALREADY_LOADED','PULSE wurde bereits geladen.');
   try{storage=getStorage()}catch(e){throw fault('READ_FAILED','Der Browser gibt den PULSE-Speicher nicht frei.',e)}
   expected=read();original=expected;
   // An unreadable/corrupt/future state never falls back to seeded data.
   let input;if(expected===null)input=state.create();else{try{input=JSON.parse(expected)}catch(e){throw fault('INVALID_JSON','Die gespeicherten Daten konnten nicht gelesen werden. Das Original bleibt erhalten.',e)}}
   const prepared=state.normalize(migrate(state.normalize(input)));
   if(expected===null||JSON.stringify(input)!==JSON.stringify(prepared))transact(prepared,'pulseOS_pre_migration_backup');
   loaded=true;return prepared;
  })}
  function save(value){return attempt(()=>{if(!loaded)throw fault('NOT_LOADED','Daten sind noch nicht geladen.');return transact(value)})}
  function prepareImport(text){return state.normalize(migrate(state.parseBackup(text)))}
  function restore(text,currentState){return attempt(()=>{
   if(!loaded)throw fault('NOT_LOADED','Daten sind noch nicht geladen.');
   if(lastError)throw fault('UNSAVED_DATA','Bitte offene Änderungen zuerst exportieren und das Speicherproblem beheben.');
   const prepared=prepareImport(text);
   // Capture metadata can be pending without a failed save; preserve it too.
   if(currentState!==undefined){const pending=JSON.stringify(state.normalize(currentState));if(expected===null||pending!==JSON.stringify(JSON.parse(expected))){assertUnchanged();write('pulseOS_pre_import_memory_backup',pending)}}
   return transact(prepared,'pulseOS_pre_import_backup');
  })}
  function exportText(value,{wrapped=true,version='21.0.0',now=new Date()}={}){
   // Emergency export deliberately does not reject uncommitted in-memory data.
   return JSON.stringify(wrapped?{app:'PULSE',version,schemaVersion:value.schemaVersion||state.SCHEMA_VERSION,exportedAt:now.toISOString(),data:value}:value,null,2);
  }
  return {load,save,prepareImport,restore,exportText,get lastError(){return lastError},get originalBytes(){return original},get storedBytes(){return expected}};
 }
 return {create};
});


