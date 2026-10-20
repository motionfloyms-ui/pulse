// SOURCE: ui/food-scan.js
/* Essen: barcode scanner (camera + Open Food Facts), own foods, today's summary and the body card on Tag. */
const SCAN_ICON='<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M4 7V5a1 1 0 0 1 1-1h2M17 4h2a1 1 0 0 1 1 1v2M20 17v2a1 1 0 0 1-1 1h-2M7 20H5a1 1 0 0 1-1-1v-2M8 8v8M11 8v8M14 8v8M17 8v8"/></svg>';
let scanStream=null,scanLoop=null,scanFood=null;
const de=n=>Number(n||0).toLocaleString('de-DE',{maximumFractionDigits:1});
function goalValue(k){const f=typeof currentFact==='function'?currentFact('goal',k):null;const n=Number(f?.value);return Number.isFinite(n)&&n>0?n:null}
function stopScanner(){if(scanLoop){cancelAnimationFrame(scanLoop);scanLoop=null}if(scanStream){scanStream.getTracks().forEach(t=>t.stop());scanStream=null}}
async function openFoodScanner(){
 scanFood=null;
 libDetailShell('<span class="life-kicker">Barcode</span><h2 id="lifeDetailHeading" tabindex="-1">Packung scannen</h2><p class="life-detail-intro">Halte den Strichcode ruhig ins Bild. Die Nährwerte kommen von Open Food Facts, einer freien Datenbank. Dafür wird nur die Nummer gesendet.</p>'+
  '<div class="food-scan-view" id="foodScanView"><video id="foodScanVideo" playsinline muted></video><span class="food-scan-frame" aria-hidden="true"></span></div><p class="capture-understanding" id="foodScanStatus" aria-live="polite">Kamera wird gestartet …</p>'+
  '<label>Oder Nummer eintippen<input id="foodScanCode" inputmode="numeric" autocomplete="off" placeholder="z. B. 4008400401621"/></label><div class="life-detail-actions">'+lifeButton('Nachschlagen',"lookupBarcode(document.getElementById('foodScanCode').value)",'life-btn dark')+'</div><div id="foodScanResult" aria-live="polite"></div>');
 const status=t=>{const e=document.getElementById('foodScanStatus');if(e)e.textContent=t};
 if(!('BarcodeDetector' in globalThis)||!navigator.mediaDevices?.getUserMedia){document.getElementById('foodScanView').hidden=true;return status('Dieser Browser kann keine Strichcodes erkennen. Tipp die Nummer unter dem Strichcode ein.')}
 try{
  const formats=(await BarcodeDetector.getSupportedFormats?.()||[]).filter(f=>['ean_13','ean_8','upc_a','upc_e'].includes(f));
  const detector=new BarcodeDetector({formats:formats.length?formats:['ean_13','ean_8']});
  scanStream=await navigator.mediaDevices.getUserMedia({video:{facingMode:{ideal:'environment'}},audio:false});
  const video=document.getElementById('foodScanVideo');if(!video){stopScanner();return}
  video.srcObject=scanStream;await video.play();status('Suche Strichcode …');
  let busy=false,last=0;
  const tick=async t=>{if(!scanStream)return;scanLoop=requestAnimationFrame(tick);if(busy||t-last<220||video.readyState<2)return;busy=true;last=t;
   try{const codes=await detector.detect(video);const code=codes.map(c=>c.rawValue).find(PulseFoods.validBarcode);if(code){stopScanner();navigator.vibrate?.(40);document.getElementById('foodScanCode').value=code;lookupBarcode(code)}}catch(_){}busy=false};
  scanLoop=requestAnimationFrame(tick);
 }catch(e){stopScanner();document.getElementById('foodScanView').hidden=true;status(e.name==='NotAllowedError'?'PULSE darf die Kamera noch nicht nutzen. Erlaube es in den Website-Einstellungen oder tipp die Nummer ein.':'Die Kamera ließ sich nicht starten. Tipp die Nummer ein.')}
}
async function lookupBarcode(raw){
 const code=String(raw||'').replace(/\D/g,''),box=document.getElementById('foodScanResult'),status=document.getElementById('foodScanStatus');
 if(!box)return;if(!PulseFoods.validBarcode(code)){box.innerHTML='';return toast('Ein Strichcode hat 8 oder 13 Ziffern.')}
 stopScanner();const view=document.getElementById('foodScanView');if(view)view.hidden=true;
 const mine=db.foodLibrary.find(f=>f.barcode===code);
 if(mine){scanFood=mine;if(status)status.textContent='Aus deinen Lebensmitteln.';return renderScanFood()}
 if(status)status.textContent='Schlage '+code+' nach …';
 try{
  const ctrl=new AbortController(),timer=setTimeout(()=>ctrl.abort(),9000);
  const res=await fetch('https://world.openfoodfacts.org/api/v2/product/'+code+'.json?fields=product_name,product_name_de,generic_name,brands,nutriments,serving_size',{signal:ctrl.signal});clearTimeout(timer);
  const food=res.ok?PulseFoods.fromOpenFoodFacts(await res.json(),code):null;
  if(!food){if(status)status.textContent='';box.innerHTML='<div class="note"><b>Dieses Produkt kenne ich noch nicht.</b><p>Trag die Werte von der Packung einmal selbst ein. Beim nächsten Scan erkennt PULSE es dann sofort, auch offline.</p><div class="actions">'+lifeButton('Selbst anlegen',lifeCall('lifeFoodEditor',null,{barcode:code}),'life-btn dark')+'</div></div>';return}
  scanFood=food;if(status)status.textContent='Gefunden bei Open Food Facts.';renderScanFood();
 }catch(_){if(status)status.textContent='';box.innerHTML='<div class="note"><b>Keine Verbindung zur Datenbank.</b><p>Ohne Internet kann ich nur Produkte erkennen, die du schon gespeichert hast.</p><div class="actions">'+lifeButton('Selbst anlegen',lifeCall('lifeFoodEditor',null,{barcode:code}),'life-btn')+'</div></div>'}
}
function renderScanFood(){
 const f=scanFood,box=document.getElementById('foodScanResult');if(!f||!box)return;
 const piece=!!f.perPiece,amount=piece?1:(f.defaultG||100);
 box.innerHTML='<div class="food-scan-card"><b>'+esc(f.name)+'</b>'+(f.brand?'<small>'+esc(f.brand)+'</small>':'')+'<p class="food-scan-per">'+(piece?'pro Stück':'pro 100 g')+': '+de((f.perPiece||f.per100).kcal)+' kcal · '+de((f.perPiece||f.per100).protein)+' g Protein</p>'+
  '<label>'+(piece?'Wie viele Stück?':'Wie viel hattest du? (g)')+'<input id="foodScanAmount" type="number" inputmode="decimal" min="0" step="'+(piece?'1':'5')+'" value="'+amount+'" oninput="scanAmountChanged()"/></label><p class="food-scan-total" id="foodScanTotal"></p>'+
  '<div class="life-detail-actions">'+lifeButton('Eintragen','scanCommit()','life-btn dark')+(db.foodLibrary.some(x=>x.id===f.id)?'':lifeButton('Nur speichern','scanSaveOnly()','life-btn'))+'</div></div>';
 scanAmountChanged();
}
function scanAmountChanged(){const a=Number(document.getElementById('foodScanAmount')?.value),t=document.getElementById('foodScanTotal');if(!t||!scanFood)return;if(!(a>0)){t.textContent='Bitte eine Menge eingeben.';return}const n=PulseFoods.portion(scanFood,a);t.textContent=de(n.kcal)+' kcal · '+de(n.protein)+' g Protein · '+de(n.carbs)+' g Kohlenhydrate · '+de(n.fat)+' g Fett'}
function rememberFood(f){const i=db.foodLibrary.findIndex(x=>x.id===f.id);if(i<0)db.foodLibrary.push({...f,savedAt:new Date().toISOString()});else db.foodLibrary[i]={...db.foodLibrary[i],...f}}
function scanCommit(){
 const f=scanFood,a=Number(document.getElementById('foodScanAmount')?.value);if(!f||!(a>0))return toast('Bitte eine Menge eingeben.');
 try{rememberFood(f);const n=PulseFoods.portion(f,a);const m=commitMeal({name:f.name+' '+(f.perPiece?a+' Stück':a+' g'),...n,note:f.brand||'',source:f.source==='openfoodfacts'?'barcode':'own-food',confidence:'calculated'});save();lifeCloseSheet();render();toast(m.name+' eingetragen · '+de(m.kcal)+' kcal','Rückgängig')}catch(e){toast(e.message)}
}
function scanSaveOnly(){if(!scanFood)return;rememberFood(scanFood);if(save()){renderScanFood();toast('In deinen Lebensmitteln gespeichert')}}
function lifeFoodEditor(id=null,prefill={}){
 const f=id?db.foodLibrary.find(x=>x.id===id):null,base=f?(f.perPiece||f.per100):{},v=k=>esc(prefill[k]??base[k]??'');
 libDetailShell('<span class="life-kicker">'+(f?'Lebensmittel bearbeiten':'Eigenes Lebensmittel')+'</span><h2 id="lifeDetailHeading" tabindex="-1">'+(f?esc(f.name):'Von der Packung übernehmen')+'</h2><p class="life-detail-intro">Einmal eintragen, danach versteht PULSE es überall, auch in Sätzen wie „150 g '+esc(prefill.name||f?.name||'Hafermilch')+'“.</p>'+
  '<form id="foodEditForm" onsubmit="event.preventDefault();lifeSaveFood('+esc(JSON.stringify(id))+')"><label>Name<input name="name" required maxlength="80" value="'+esc(prefill.name??f?.name??'')+'"/></label><label>Andere Namen · mit Komma getrennt<input name="aliases" placeholder="z. B. Skyr Natur, mein Skyr" value="'+esc((f?.aliases||[]).slice(1).join(', '))+'"/></label>'+
  '<label>Werte gelten<select name="basis"><option value="100g"'+(f?.perPiece?'':' selected')+'>pro 100 g</option><option value="piece"'+(f?.perPiece?' selected':'')+'>pro Stück</option></select></label>'+
  '<div class="life-form-row"><label>kcal<input name="kcal" type="number" inputmode="decimal" step="0.1" required value="'+v('kcal')+'"/></label><label>Protein · g<input name="protein" type="number" inputmode="decimal" step="0.1" required value="'+v('protein')+'"/></label><label>Kohlenhydrate · g<input name="carbs" type="number" inputmode="decimal" step="0.1" value="'+v('carbs')+'"/></label><label>Fett · g<input name="fat" type="number" inputmode="decimal" step="0.1" value="'+v('fat')+'"/></label><label>Ballaststoffe · g<input name="fiber" type="number" inputmode="decimal" step="0.1" value="'+v('fiber')+'"/></label><label>Übliche Portion · g<input name="defaultG" type="number" inputmode="decimal" value="'+esc(f?.defaultG??'')+'"/></label></div>'+
  '<input type="hidden" name="barcode" value="'+esc(prefill.barcode??f?.barcode??'')+'"/><div class="life-detail-actions"><button class="life-btn dark" type="submit">Speichern</button>'+(f?lifeButton('Löschen',lifeCall('lifeDeleteFood',id),'life-textbtn life-discard'):'')+'</div></form>');
}
function lifeSaveFood(id){
 const fields=Object.fromEntries(new FormData(document.getElementById('foodEditForm')));
 try{const food=PulseFoods.own(fields,id||uid('own'));const i=db.foodLibrary.findIndex(x=>x.id===food.id);if(i<0)db.foodLibrary.push(food);else db.foodLibrary[i]=food;
  if(save()){lifeCloseSheet();render();toast(food.name+' gespeichert');const t=document.getElementById('smartFoodText');if(t?.value.trim()&&document.getElementById('appMain').dataset.view==='nutrition')understandFood()}}catch(e){toast(e.message)}
}
function lifeDeleteFood(id){const i=db.foodLibrary.findIndex(x=>x.id===id);if(i<0)return;const f=db.foodLibrary.splice(i,1)[0];if(save()){lifeCloseSheet();render();toast(f.name+' gelöscht')}}
function renderFoodLibrary(){
 const el=document.getElementById('foodLibraryList');if(!el)return;
 const list=db.foodLibrary.slice().sort((a,b)=>a.name.localeCompare(b.name,'de'));
 el.innerHTML=list.length?list.map(f=>{const b=f.perPiece||f.per100||{};return '<button type="button" class="item food-lib-item" onclick="'+lifeCall('lifeFoodEditor',f.id)+'"><span class="grow"><b>'+esc(f.name)+'</b><small>'+de(b.kcal)+' kcal · '+de(b.protein)+' g Protein '+(f.perPiece?'pro Stück':'pro 100 g')+(f.source==='openfoodfacts'?' · gescannt':'')+'</small></span><span aria-hidden="true">›</span></button>'}).join(''):'<div class="empty">Noch keine eigenen Lebensmittel. Scanne eine Packung oder leg eins von Hand an.</div>';
}
function renderFoodToday(){
 const el=document.getElementById('foodToday');if(!el)return;const d=today(),p=goalValue('protein'),k=goalValue('calories'),w=Number(db.waterGoal)||2;
 const bar=(v,goal)=>goal?'<span class="food-bar"><i style="width:'+Math.min(100,Math.round(v/goal*100))+'%"></i></span>':'';
 el.innerHTML='<div><small>Protein</small><b>'+Math.round(d.protein||0)+(p?' <span>/ '+p+' g</span>':' g')+'</b>'+bar(d.protein||0,p)+'</div><div><small>Energie</small><b>'+Math.round(d.kcal||0)+(k?' <span>/ '+k+'</span>':'')+' <span>kcal</span></b>'+bar(d.kcal||0,k)+'</div><div><small>Wasser</small><b>'+de(d.water)+' <span>/ '+de(w)+' L</span></b>'+bar(d.water||0,w)+'<button type="button" class="small" onclick="addWater(.25)">+ 250 ml</button></div>';
}
/* Tag: one compact line for the body, so the day screen knows about training and food. */
function lifeBodyCard(date){
 if(date!==key())return '';
 const c=pulseContext(),d=today(),p=goalValue('protein'),t=c.training;
 const training=c.mode==='recovery'?'Erholung':t?.completed?'Training erledigt':t?.active?'Training läuft':t?.kind==='home'?'Heimtraining':t?'Training '+t.plan:'Kein Training';
 return '<button type="button" class="life-body-card" onclick="goView(\'bodyhub\')"><span class="green">'+lifeGlyph('leaf')+'</span><span class="grow"><b>'+esc(training)+'</b><small>'+Math.round(d.protein||0)+(p?' von '+p:'')+' g Protein · '+de(d.water)+' L Wasser · '+(d.meals||0)+' '+(d.meals===1?'Mahlzeit':'Mahlzeiten')+'</small></span><i aria-hidden="true">›</i></button>';
}
