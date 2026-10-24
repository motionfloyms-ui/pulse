// SOURCE: storage/photos.js
/* Photos live in IndexedDB (localStorage is far too small). Records reference them by id. */
const PulsePhotos=(()=>{
 'use strict';
 let opening=null;const urls=new Map();
 const supported='indexedDB' in globalThis;
 const req=r=>new Promise((res,rej)=>{r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});
 function open(){if(!opening)opening=new Promise((res,rej)=>{const r=indexedDB.open('pulse-photos',1);r.onupgradeneeded=()=>r.result.createObjectStore('photos',{keyPath:'id'});r.onsuccess=()=>res(r.result);r.onerror=()=>rej(r.error)});return opening}
 async function store(mode){return (await open()).transaction('photos',mode).objectStore('photos')}
 async function put(rec){return req((await store('readwrite')).put(rec))}
 async function get(id){return req((await store('readonly')).get(id))}
 async function all(){return req((await store('readonly')).getAll())}
 async function remove(id){if(urls.has(id)){URL.revokeObjectURL(urls.get(id));urls.delete(id)}return req((await store('readwrite')).delete(id))}
 function loadImage(file){return new Promise((res,rej)=>{const u=URL.createObjectURL(file),img=new Image();img.onload=()=>{URL.revokeObjectURL(u);res(img)};img.onerror=()=>{URL.revokeObjectURL(u);rej(Error('Dieses Bild kann ich nicht lesen.'))};img.src=u})}
 async function compress(file,max=1600,quality=.82){
  let src;try{src=await createImageBitmap(file,{imageOrientation:'from-image'})}catch(_){src=await loadImage(file)}
  const w=src.width,h=src.height,k=Math.min(1,max/Math.max(w,h)),c=document.createElement('canvas');
  c.width=Math.round(w*k);c.height=Math.round(h*k);c.getContext('2d').drawImage(src,0,0,c.width,c.height);src.close?.();
  return new Promise((res,rej)=>c.toBlob(b=>b?res(b):rej(Error('Foto konnte nicht verkleinert werden.')),'image/jpeg',quality));
 }
 async function add(file){
  if(!supported)throw Error('Fotos brauchen einen Browser mit IndexedDB.');
  if(!/^image\//.test(file.type))throw Error('Das ist kein Bild.');
  const blob=await compress(file),id='ph-'+Date.now().toString(36)+Math.random().toString(36).slice(2,8);
  await put({id,blob,created:new Date().toISOString()});return id;
 }
 async function url(id){if(urls.has(id))return urls.get(id);const r=await get(id);if(!r)return null;const u=URL.createObjectURL(r.blob);urls.set(id,u);return u}
 async function hydrate(root){for(const img of root.querySelectorAll('img[data-photo-id]')){const u=await url(img.dataset.photoId).catch(()=>null);if(u)img.src=u;else img.closest('.life-photo')?.classList.add('missing')}}
 async function collect(keep){if(!supported)return;const set=new Set(keep);for(const r of await all())if(!set.has(r.id))await remove(r.id)}
 const toDataURL=blob=>new Promise((res,rej)=>{const f=new FileReader();f.onload=()=>res(f.result);f.onerror=()=>rej(f.error);f.readAsDataURL(blob)});
 function fromDataURL(d){const [head,body]=d.split(',');const bin=atob(body),bytes=new Uint8Array(bin.length);for(let i=0;i<bin.length;i++)bytes[i]=bin.charCodeAt(i);return new Blob([bytes],{type:head.slice(5).split(';')[0]})}
 async function exportSome(ids){if(!supported)return {};const out={};for(const id of ids){const r=await get(id).catch(()=>null);if(r&&r.blob)out[id]=await toDataURL(r.blob)}return out}
 async function exportAll(){if(!supported)return {};const out={};for(const r of await all())out[r.id]=await toDataURL(r.blob);return out}
 async function importAll(map){if(!supported||!map||typeof map!=='object')return 0;let n=0;for(const [id,d] of Object.entries(map)){if(!/^ph-[a-z0-9]+$/.test(id)||typeof d!=='string'||!d.startsWith('data:image/'))continue;await put({id,blob:fromDataURL(d),created:new Date().toISOString()});n++}return n}
 return {supported,add,url,hydrate,collect,exportSome,exportAll,importAll};
})();
function photoReferences(){
 const refs=new Set();
 for(const x of PulseLife.list(db,{archived:true}))(x.photos||[]).forEach(id=>refs.add(id));
 (lifeState().draft?.photos||[]).forEach(id=>refs.add(id));
 for(const id of JSON.stringify(db.undoStack||[]).match(/ph-[a-z0-9]+/g)||[])refs.add(id);
 lifeEditorPhotos.forEach(id=>refs.add(id));
 return refs;
}
function photoTiles(ids,{removable=false}={}){
 return ids.map((id,i)=>'<span class="life-photo"><button type="button" class="life-photo-open" aria-label="Foto '+(i+1)+' groß ansehen" onclick="'+lifeCall('lifeViewPhoto',id)+'"><img data-photo-id="'+esc(id)+'" alt=""/></button>'+(removable?'<button type="button" class="life-photo-remove" aria-label="Foto '+(i+1)+' entfernen" onclick="'+lifeCall('lifeRemoveEditorPhoto',id)+'">×</button>':'')+'</span>').join('');
}
let lifeEditorPhotos=[];
function renderEditorPhotos(){const row=document.getElementById('lifePhotoRow');if(!row)return;row.innerHTML=photoTiles(lifeEditorPhotos,{removable:true});row.hidden=!lifeEditorPhotos.length;PulsePhotos.hydrate(row)}
async function lifeAddPhotos(files){
 const list=[...(files||[])].slice(0,Math.max(0,8-lifeEditorPhotos.length));
 if(!list.length)return toast(lifeEditorPhotos.length>=8?'Höchstens 8 Fotos pro Eintrag.':'Kein Foto ausgewählt.');
 const state=document.getElementById('lifeDraftState');if(state)state.textContent='Foto wird vorbereitet …';
 for(const file of list){try{lifeEditorPhotos.push(await PulsePhotos.add(file))}catch(e){toast(e.message)}}
 renderEditorPhotos();lifeRememberDraft();
}
function lifeRemoveEditorPhoto(id){lifeEditorPhotos=lifeEditorPhotos.filter(x=>x!==id);renderEditorPhotos();lifeRememberDraft()}
async function lifeViewPhoto(id){
 const u=await PulsePhotos.url(id);if(!u)return toast('Dieses Foto ist auf diesem Gerät nicht mehr vorhanden.');
 const v=document.createElement('div');v.className='life-photo-viewer';v.setAttribute('role','dialog');v.setAttribute('aria-label','Foto');
 v.innerHTML='<img alt="" src="'+u+'"/><button type="button" class="life-iconbtn" aria-label="Foto schließen">×</button>';
 const close=()=>{v.remove();document.removeEventListener('keydown',key,true)};const key=e=>{if(e.key==='Escape'){e.stopPropagation();close()}};
 v.onclick=close;document.addEventListener('keydown',key,true);document.body.appendChild(v);v.querySelector('button').focus();
}

