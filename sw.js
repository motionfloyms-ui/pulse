/* PULSE offline cache. Pages: network first and revalidated (so updates arrive at once), offline falls back to the cache. */
const CACHE='pulse-45';
const SHELL=['./','./index.html','./manifest.webmanifest','./icons/icon-192.png','./icons/icon-512.png','./icons/maskable-512.png'];
self.addEventListener('install',e=>e.waitUntil(caches.open(CACHE).then(c=>c.addAll(SHELL)).then(()=>self.skipWaiting())));
self.addEventListener('activate',e=>e.waitUntil(caches.keys().then(keys=>Promise.all(keys.filter(k=>k!==CACHE&&k!=='pulse-share').map(k=>caches.delete(k)))).then(()=>self.clients.claim())));
/* Share target: Android hands shared photos and text over as a POST. Keep the photos for the page in a
   small cache, then open PULSE with the text as ordinary launch parameters. */
async function receiveShare(r){
  const q=new URLSearchParams();let files=[];
  try{
    const form=await r.formData(),c=await caches.open('pulse-share');
    for(const k of await c.keys())await c.delete(k);
    files=form.getAll('photos').filter(f=>f&&typeof f==='object'&&/^image\//.test(f.type||'')).slice(0,8);
    await Promise.all(files.map((f,i)=>c.put('./__share/'+i,new Response(f,{headers:{'content-type':f.type}}))));
    for(const k of ['title','text','url']){const v=form.get(k);if(typeof v==='string'&&v.trim())q.set(k,v.trim().slice(0,4000))}
  }catch(_){files=[]}
  if(files.length)q.set('shared',String(files.length));
  return Response.redirect(new URL('./?'+q.toString(),self.registration.scope).href,303);
}
self.addEventListener('fetch',e=>{
  const r=e.request;
  if(r.method==='POST'&&new URL(r.url).pathname===new URL('./share',self.registration.scope).pathname){e.respondWith(receiveShare(r));return}
  if(r.method!=='GET'||new URL(r.url).origin!==location.origin)return;
  if(r.mode==='navigate'){
    e.respondWith(fetch(r,{cache:'no-cache'}).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put('./index.html',copy))}return res}).catch(()=>caches.match('./index.html')));
    return;
  }
  e.respondWith(caches.match(r,{ignoreSearch:true}).then(hit=>hit||fetch(r).then(res=>{if(res.ok){const copy=res.clone();caches.open(CACHE).then(c=>c.put(r,copy))}return res})));
});
self.addEventListener('notificationclick',e=>{
  e.notification.close();
  e.waitUntil(self.clients.matchAll({type:'window',includeUncontrolled:true}).then(list=>{const c=list.find(w=>'focus' in w);if(c){c.focus();return c.navigate?c.navigate('./#calendar').catch(()=>{}):null}return self.clients.openWindow('./#calendar')}));
});
