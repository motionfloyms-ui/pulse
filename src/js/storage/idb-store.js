// SOURCE: storage/idb-store.js
/* IndexedDB for the state: (1) the main state once localStorage is too small, with a revision
   number so two windows cannot overwrite each other, (2) automatic daily snapshots ("Zeitreise").
   Pure promise API; no knowledge of the app. */
const PulseIDB=(()=>{
 'use strict';
 const supported=typeof indexedDB!=='undefined';
 let opening=null;
 const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 function open(){
  if(!supported)return Promise.reject(Error('IndexedDB fehlt in diesem Browser.'));
  if(!opening)opening=new Promise((res,rej)=>{const r=indexedDB.open('pulse-state',1);r.onupgradeneeded=()=>{const d=r.result;if(!d.objectStoreNames.contains('main'))d.createObjectStore('main');if(!d.objectStoreNames.contains('snapshots'))d.createObjectStore('snapshots',{keyPath:'id'})};r.onsuccess=()=>{const d=r.result;d.onversionchange=()=>d.close();res(d)};r.onerror=()=>{opening=null;rej(r.error)};r.onblocked=()=>{opening=null;rej(Error('Die Browser-Datenbank ist blockiert. Bitte andere PULSE-Fenster schließen.'))}});
  return opening;
 }
 const done=t=>new Promise((res,rej)=>{t.oncomplete=()=>res();t.onerror=()=>rej(t.error);t.onabort=()=>rej(t.error||Error('Abgebrochen'))});
 async function getMain(){const d=await open();return (await req(d.transaction('main','readonly').objectStore('main').get('state')))||null}
 /* Writes the main state only if the stored revision is the one this window last saw (or `expected` is null). */
 async function putMain(rec,expected){
  const d=await open(),t=d.transaction('main','readwrite'),s=t.objectStore('main');let conflict=false;
  const cur=await req(s.get('state'));
  if(expected!=null&&cur&&cur.rev!==expected){conflict=true;t.abort()}else s.put(rec,'state');
  try{await done(t)}catch(e){if(!conflict)throw e}
  if(conflict){const e=Error('Der gespeicherte Stand wurde in einem anderen Fenster geändert. Exportiere deine offenen Änderungen und lade PULSE neu.');e.code='CONFLICT';throw e}
 }
 async function deleteMain(){const d=await open(),t=d.transaction('main','readwrite');t.objectStore('main').delete('state');await done(t)}
 async function putSnapshot(rec){const d=await open(),t=d.transaction('snapshots','readwrite');t.objectStore('snapshots').put(rec);await done(t)}
 async function listSnapshots(){const d=await open(),all=await req(d.transaction('snapshots','readonly').objectStore('snapshots').getAll());return all.map(({text,...meta})=>meta).sort((a,b)=>b.savedAt.localeCompare(a.savedAt))}
 async function getSnapshot(id){const d=await open();return (await req(d.transaction('snapshots','readonly').objectStore('snapshots').get(id)))||null}
 async function deleteSnapshot(id){const d=await open(),t=d.transaction('snapshots','readwrite');t.objectStore('snapshots').delete(id);await done(t)}
 return {supported,getMain,putMain,deleteMain,putSnapshot,listSnapshots,getSnapshot,deleteSnapshot};
})();
