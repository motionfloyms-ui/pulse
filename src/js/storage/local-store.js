// SOURCE: storage/local-store.js
/* Storage adapter: synchronous localStorage as long as the data fits; when the browser's quota is
   reached, the state moves to IndexedDB (no practical size limit) and saves become asynchronous.
   A small marker in localStorage tells the next start where the data lives. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseStorage=api})(globalThis,function(){
 'use strict';
 function fault(code,message,cause){const e=new Error(message);e.code=code;e.cause=cause;return e}
 function create({getStorage,state,migrate,key='pulseOS',idb=null,onAsyncError=null}){
  let storage=null,expected=null,original=null,loaded=false,lastError=null;
  let mode='ls',rev=0,chain=Promise.resolve();
  const META=key+'_meta';
  function init(){if(!storage){try{storage=getStorage()}catch(e){throw fault('READ_FAILED','Der Browser gibt den PULSE-Speicher nicht frei.',e)}}}
  function readMeta(){try{const m=JSON.parse(storage.getItem(META)||'null');return m&&m.where==='idb'?m:null}catch(_){return null}}
  /* True when the data lives in IndexedDB: the app must then start with loadAsync(). */
  function needsAsyncLoad(){try{init()}catch(_){return false}return !!readMeta()&&!!idb}
  /* Queues an IndexedDB write. Order is kept; a failure is reported through onAsyncError. */
  function queueIdb(bytes,first=false){
   const mine=++rev,prev=first?null:mine-1;
   chain=chain.then(async()=>{
    await idb.putMain({text:bytes,rev:mine,savedAt:new Date().toISOString()},prev);
    try{storage.setItem(META,JSON.stringify({where:'idb',rev:mine}))}catch(_){}
    if(first){try{storage.removeItem(key)}catch(_){}dropBackups('')}
   }).catch(e=>{lastError=e&&e.code==='CONFLICT'?e:fault('WRITE_FAILED','PULSE konnte nicht in die Browser-Datenbank speichern. Bitte exportiere deine Daten.',e);if(onAsyncError)try{onAsyncError(lastError)}catch(_){}});
   return chain;
  }
  function switchToIdb(value){
   const prepared=state.normalize(value),bytes=JSON.stringify(prepared);
   mode='idb';rev=0;expected=bytes;lastError=null;queueIdb(bytes,true);return prepared;
  }
  function read(){try{return storage.getItem(key)}catch(e){throw fault('READ_FAILED','PULSE kann die gespeicherten Daten gerade nicht lesen.',e)}}
  function assertUnchanged(){if(read()!==expected)throw fault('CONFLICT','Der gespeicherte Stand wurde in einem anderen Fenster geändert. Exportiere deine offenen Änderungen und lade PULSE neu.')}
  /* Safety copies of earlier states. When the browser's quota is full they give way to the current data. */
  const BACKUPS=['pulseOS_pre_import_memory_backup','pulseOS_pre_import_backup','pulseOS_pre_migration_backup'];
  const isQuota=e=>!!e&&(e.name==='QuotaExceededError'||e.name==='NS_ERROR_DOM_QUOTA_REACHED'||e.code===22||e.code===1014);
  let freedBackups=false;
  function dropBackups(except){let freed=false;for(const k of BACKUPS){if(k===except)continue;try{if(storage.getItem(k)!==null){storage.removeItem(k);freed=true}}catch(_){}}if(freed)freedBackups=true;return freed}
  function write(name,bytes){
   try{storage.setItem(name,bytes)}catch(e){
    if(isQuota(e)&&dropBackups(name)){try{storage.setItem(name,bytes);return}catch(e2){e=e2}}
    throw fault('WRITE_FAILED','PULSE konnte nicht speichern. Deine offenen Änderungen bleiben in diesem Fenster; bitte exportiere sie.',e)}
  }
  /* A safety copy that does not fit is skipped instead of blocking the save itself. */
  function writeBackup(name,bytes){try{storage.setItem(name,bytes)}catch(e){if(!isQuota(e))throw fault('WRITE_FAILED','PULSE konnte keine Sicherungskopie anlegen.',e);try{storage.removeItem(name)}catch(_){}freedBackups=true}}
  function transact(value,backupKey){
   const prepared=state.normalize(value),bytes=JSON.stringify(prepared);
   assertUnchanged();
   if(backupKey&&expected!==null)writeBackup(backupKey,expected);
   assertUnchanged();
   write(key,bytes);expected=bytes;lastError=null;return prepared;
  }
  /* Characters used in this origin's localStorage (all keys) and Chrome's limit of about 5.2 million. */
  function usage(){let used=0,backups=0;try{for(let i=0;i<storage.length;i++){const k=storage.key(i),v=storage.getItem(k)||'';used+=k.length+v.length;if(BACKUPS.includes(k))backups+=v.length}}catch(_){}return {used,backups,quota:5200000,freedBackups,mode,size:expected?expected.length:0}}
  function attempt(fn){try{return fn()}catch(e){lastError=e;throw e}}
  function load(){return attempt(()=>{
   if(loaded)throw fault('ALREADY_LOADED','PULSE wurde bereits geladen.');
   init();
   // Data that moved to IndexedDB is never replaced by an empty start.
   if(readMeta())throw fault('READ_FAILED','Deine Daten liegen in der Browser-Datenbank (IndexedDB), die gerade nicht erreichbar ist. Es wurde nichts verändert.');
   expected=read();original=expected;
   // An unreadable/corrupt/future state never falls back to seeded data.
   let input;if(expected===null)input=state.create();else{try{input=JSON.parse(expected)}catch(e){throw fault('INVALID_JSON','Die gespeicherten Daten konnten nicht gelesen werden. Das Original bleibt erhalten.',e)}}
   const prepared=state.normalize(migrate(state.normalize(input)));
   if(expected===null||JSON.stringify(input)!==JSON.stringify(prepared))transact(prepared,'pulseOS_pre_migration_backup');
   loaded=true;return prepared;
  })}
  async function loadAsync(){
   try{
    if(loaded)throw fault('ALREADY_LOADED','PULSE wurde bereits geladen.');
    init();if(!idb)throw fault('READ_FAILED','Die Daten liegen in der Browser-Datenbank, die hier nicht erreichbar ist.');
    let rec;try{rec=await idb.getMain()}catch(e){throw fault('READ_FAILED','PULSE kann die Browser-Datenbank gerade nicht lesen.',e)}
    if(!rec){if(read()!==null){storage.removeItem(META);return load()}throw fault('INVALID_JSON','Die Daten in der Browser-Datenbank fehlen. Bitte ein Backup importieren.')}
    let input;try{input=JSON.parse(rec.text)}catch(e){throw fault('INVALID_JSON','Die gespeicherten Daten konnten nicht gelesen werden. Das Original bleibt erhalten.',e)}
    const prepared=state.normalize(migrate(state.normalize(input)));
    mode='idb';rev=Number(rec.rev)||0;expected=rec.text;original=rec.text;loaded=true;
    if(JSON.stringify(input)!==JSON.stringify(prepared)){expected=JSON.stringify(prepared);queueIdb(expected)}
    return prepared;
   }catch(e){lastError=e;throw e}
  }
  function save(value){return attempt(()=>{
   if(!loaded)throw fault('NOT_LOADED','Daten sind noch nicht geladen.');
   if(mode==='idb'){const prepared=state.normalize(value),bytes=JSON.stringify(prepared);expected=bytes;lastError=null;queueIdb(bytes);return prepared}
   try{return transact(value)}catch(e){if(e.code==='WRITE_FAILED'&&isQuota(e.cause)&&idb)return switchToIdb(value);throw e}
  })}
  /* Resolves when every queued IndexedDB write is done (e.g. before a reload). */
  function flush(){return chain}
  function prepareImport(text){return state.normalize(migrate(state.parseBackup(text)))}
  function restore(text,currentState){return attempt(()=>{
   if(!loaded)throw fault('NOT_LOADED','Daten sind noch nicht geladen.');
   if(lastError)throw fault('UNSAVED_DATA','Bitte offene Änderungen zuerst exportieren und das Speicherproblem beheben.');
   const prepared=prepareImport(text);
   if(mode==='idb'){const bytes=JSON.stringify(prepared);expected=bytes;queueIdb(bytes);return prepared}
   // Capture metadata can be pending without a failed save; preserve it too.
   if(currentState!==undefined){const pending=JSON.stringify(state.normalize(currentState));if(expected===null||pending!==JSON.stringify(JSON.parse(expected))){assertUnchanged();writeBackup('pulseOS_pre_import_memory_backup',pending)}}
   return transact(prepared,'pulseOS_pre_import_backup');
  })}
  function exportText(value,{wrapped=true,version='30.0.0',now=new Date()}={}){
   // Emergency export deliberately does not reject uncommitted in-memory data.
   return JSON.stringify(wrapped?{app:'PULSE',version,schemaVersion:value.schemaVersion||state.SCHEMA_VERSION,exportedAt:now.toISOString(),data:value}:value,null,2);
  }
  return {load,loadAsync,needsAsyncLoad,flush,save,prepareImport,restore,exportText,usage,dropBackups:()=>dropBackups(''),get mode(){return mode},get lastError(){return lastError},get originalBytes(){return original},get storedBytes(){return expected}};
 }
 return {create};
});


