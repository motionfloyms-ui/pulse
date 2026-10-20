// SOURCE: ui/storage-status.js
/* Error-only surface: keep data recovery possible without resetting the app. */
(function(root){
 'use strict';
 function download(text,name){const a=document.createElement('a'),url=URL.createObjectURL(new Blob([text],{type:'application/json'}));a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),1000)}
 function button(label,fn){const b=document.createElement('button');b.type='button';b.textContent=label;b.onclick=fn;return b}
 function panel(error){let el=document.getElementById('storageStatus');if(!el){el=document.createElement('section');el.id='storageStatus';el.setAttribute('role','alert');el.style.cssText='position:relative;z-index:400;max-width:640px;margin:16px auto;padding:20px;background:#fff4db;color:#201b12;border:2px solid #7a5800;border-radius:16px';document.body.prepend(el)}el.replaceChildren();const heading=document.createElement('h2');heading.textContent='Deine Daten brauchen Aufmerksamkeit';const p=document.createElement('p');p.textContent=error.message;el.append(heading,p);return el}
 function clear(){document.getElementById('storageStatus')?.remove()}
 function blocked(error,store){const el=panel(error);for(const item of document.querySelectorAll('#appMain,#bottomNav,#captureAccessory,#lifeNav,#lifeTopbar,#lifeLegacyBack')){item.style.setProperty('display','none','important');item.inert=true};if(store.originalBytes!==null)el.append(button('Originaldaten exportieren',()=>download(store.originalBytes,'PULSE_originaldaten.json')));el.append(button('Erneut laden',()=>location.reload()))}
 function unsaved(error,{exportCurrent,retry}){const el=panel(error);el.append(button('Offenen Stand exportieren',exportCurrent),button('Speichern erneut versuchen',retry))}
 root.PulseStorageUI={download,blocked,unsaved,clear};
})(globalThis);


