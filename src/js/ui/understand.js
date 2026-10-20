// SOURCE: ui/understand.js
/* One "+" for everything: the editor reads what you write and offers where it belongs.
   Nothing is filed without a tap. */
function parseWhen(raw,today=key()){return PulseCapture.when(raw,today,PulseContext.offset)}
function lifeUnderstand(){
 const box=document.getElementById('lifeUnderstand');if(!box)return;
 const form=document.getElementById('lifeForm');
 if(form.hidden||PulseLife.get(db,lifeEditingId)){box.innerHTML='';return}
 const raw=[document.getElementById('lifeTitle').value,document.getElementById('lifeBody').value].join('\n').trim();
 if(raw.length<3){box.innerHTML='';return}
 const i=interpretCapture(raw),when=parseWhen(raw),offers=[];
 if(i.type==='food'||i.type==='drink'){
  const parts=i.type==='food'?parseFoodText(raw):[],known=parts.filter(p=>!p.unknown),kcal=Math.round(known.reduce((a,p)=>a+(p.nut?.kcal||0),0));
  offers.push(['Als '+(i.type==='drink'?'Getränk':'Mahlzeit')+' eintragen'+(known.length&&known.length===parts.length?' · '+kcal+' kcal':''),'lifeRouteCapture()']);
 }
 if(i.type==='note'){const parts=parseFoodText(raw);if(parts.length&&parts.every(p=>!p.unknown)){const kcal=Math.round(parts.reduce((a,p)=>a+(p.nut?.kcal||0),0));offers.push(['Als Mahlzeit eintragen · '+kcal+' kcal','lifeRouteFood()'])}}
 if(i.type==='workout')offers.push(['Als Trainingssatz prüfen','lifeRouteCapture()']);
 if(i.type==='recovery'||i.type==='context'||i.type==='context-clear')offers.push([i.type==='recovery'?'Heute als Erholungstag markieren':'Als Befinden für heute speichern','lifeRouteCapture()']);
 if(when.date){
  const kind=when.time?'event':'task',cur={kind:document.getElementById('lifeKindInput').value,date:document.getElementById('lifeDateInput').value,time:document.getElementById('lifeTimeInput').value};
  if(cur.date!==when.date||cur.time!==when.time||cur.kind!==kind)offers.push([(kind==='event'?'Als Termin':'Als Aufgabe')+' · '+lifeDate(when.date,{weekday:'short',day:'numeric',month:'short'})+(when.time?' um '+when.time:''),lifeCall('lifeApplyWhen',kind,when.date,when.time)]);
 }
 box.innerHTML=offers.length?'<span class="life-understand-label">Erkannt</span>'+offers.map(([label,call])=>'<button type="button" class="life-understand-chip" onclick="'+call+'">'+esc(label)+'</button>').join(''):'';
}
function lifeApplyWhen(kind,date,time){
 const k=document.getElementById('lifeKindInput');if(!k.disabled)k.value=kind;
 document.getElementById('lifeDateInput').value=date;document.getElementById('lifeTimeInput').value=time||'';
 lifeKindChanged(false);document.getElementById('lifePlanning').open=true;lifeRememberDraft();lifeUnderstand();
 toast((kind==='event'?'Termin':'Aufgabe')+' für '+lifeDate(date,{weekday:'long',day:'numeric',month:'long'})+(time?' um '+time:'')+' vorbereitet. Speichern mit „Aufheben“.');
}
function lifeRouteFood(){
 const raw=[document.getElementById('lifeTitle').value,document.getElementById('lifeBody').value].filter(x=>x.trim()).join(' ').trim();if(!raw)return;
 pulseStopDictation();const meal=directFoodCapture(raw);if(!meal)return toast('Bitte die Mengen prüfen.');
 lifeState().draft=null;lifeEditorPhotos=[];save();lifeCloseSheet();render();toast(intakeMessage(meal),'Rückgängig');
}
function lifeRouteCapture(){
 const raw=[document.getElementById('lifeTitle').value,document.getElementById('lifeBody').value].filter(x=>x.trim()).join(' ').trim();
 if(!raw)return;
 pulseStopDictation();if(pulseDictation)pulseDictation.target=null;
 lifeState().draft=null;lifeEditorPhotos=[];save();lifeCloseSheet();
 const result=universalCapture(raw);
 if(result.type==='food-review'){const token=pendingFoodCapture;setTimeout(()=>{openCapture();pendingFoodCapture=token;showFoodFollowup(raw)},320);return}
 render();toast(result.message,['food','drink'].includes(result.type)?'Rückgängig':'');
}

