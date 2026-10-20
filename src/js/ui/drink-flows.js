// SOURCE: ui/drink-flows.js
function setDrinkCapture(record,done){
  const entry=record.captureKey&&brainEntries().find(e=>e.key===record.captureKey);
  if(entry){entry.record.done=done;entry.record.status=done?'completed':'current';entry.record.completedAt=done?new Date().toISOString():null}
}
function applyDrink(record,sign){
  const day=db.days[record.date];if(!day)return;
  day.water=Math.max(0,Math.round((day.water+sign*(record.waterMl||0)/1000)*1000)/1000);
  if(record.nutrition)for(const k of ['kcal','protein','carbs','fat','fiber'])if(Number.isFinite(record.nutrition[k]))day[k]=Math.max(0,nums(day[k]+sign*record.nutrition[k]));
}
function directDrinkCapture(raw){
  const parsed=PulseDrinks.parse(raw,allFoods());if(!parsed.ok)return null;
  today();const drink={id:uid('drink'),date:key(),recordedAt:new Date().toISOString(),source:'user',status:'completed',kind:'drink',time:new Date().toLocaleTimeString('de-DE',{hour:'2-digit',minute:'2-digit'}),...parsed};
  delete drink.ok;db.drinks.push(drink);applyDrink(drink,1);pushUndo({type:'drink',id:drink.id});emit('drink.logged',{drinkId:drink.id,ml:drink.ml},{source:'user',confidence:drink.confidence});return drink;
}
function directIntakeCapture(raw){return interpretCapture(raw).type==='drink'?directDrinkCapture(raw):directFoodCapture(raw)}
function intakeMessage(record){return record.kind==='drink'?record.name+' · '+record.ml+' ml eingetragen'+(record.waterMl?' · zum Wasser hinzugefügt':record.nutrition?'':' · Nährwerte offen'):record.name+' eingetragen · '+record.kcal+' kcal · '+record.protein+' g Protein'}
function removeDrink(id){
  const index=db.drinks.findIndex(x=>x.id===id);if(index<0)return;
  const record=db.drinks[index];pushUndo({type:'drink-delete',record:JSON.parse(JSON.stringify(record)),index});applyDrink(record,-1);db.drinks.splice(index,1);setDrinkCapture(record,false);save();toast('Getränk entfernt','Rückgängig');
}
function undoDrink(action){
  if(action.type==='drink'){const index=db.drinks.findIndex(x=>x.id===action.id);if(index<0)return;const record=db.drinks[index];applyDrink(record,-1);db.drinks.splice(index,1);setDrinkCapture(record,false)}
  else {db.drinks.splice(Math.min(action.index,db.drinks.length),0,action.record);applyDrink(action.record,1);setDrinkCapture(action.record,true)}
  save();toast('Getränkeeintrag rückgängig gemacht');
}
function renderDrinks(){
  document.getElementById('drinkList').innerHTML=db.drinks.filter(x=>x.date===key()).slice().reverse().map(x=>'<div class="item"><div class="grow"><small>'+esc(x.time)+'</small><b>'+esc(x.name)+' · '+esc(x.ml)+' ml</b><div class="muted">'+(x.waterMl?'Zum Wasser hinzugefügt':x.nutrition?esc(x.nutrition.kcal)+' kcal · '+esc(x.nutrition.protein)+' g Protein':'Nährwerte offen · nicht in Kalorien eingerechnet')+'</div></div><button type="button" class="small" aria-label="Getränk löschen" onclick="removeDrink('+esc(JSON.stringify(x.id))+')">×</button></div>').join('')||'<div class="empty">Noch keine Getränke erfasst. Zum Beispiel: „250 ml Wasser getrunken“.</div>';
}


