// SOURCE: domain/body/foods.js
/* Food records: own foods and products from Open Food Facts. Values are per 100 g (or per piece). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseFoods=api})(globalThis,function(){
 'use strict';
 const NUTRIENTS=['kcal','protein','carbs','fat','fiber'];
 const round=x=>Math.round(x*10)/10;
 const num=v=>{if(v==null||(typeof v==='string'&&!v.trim()))return null;const n=typeof v==='string'?Number(v.trim().replace(',','.')):v;return Number.isFinite(n)?n:null};
 function grams(text){const m=String(text||'').toLowerCase().replace(',','.').match(/(\d+(?:\.\d+)?)\s*(g|ml)\b/);return m?Number(m[1]):null}
 function cleanName(s){return String(s||'').replace(/\s+/g,' ').trim().slice(0,80)}
 function aliasesFor(name,brand,extra=[]){
  const out=new Set();const n=cleanName(name).toLocaleLowerCase('de');if(n)out.add(n);
  if(brand&&n)out.add((cleanName(brand).split(',')[0]+' '+n).toLocaleLowerCase('de'));
  for(const a of extra){const t=cleanName(a).toLocaleLowerCase('de');if(t.length>=2)out.add(t)}
  return [...out].slice(0,8);
 }
 /* Open Food Facts API v2 product → food, or null when calories or protein are unknown. */
 function fromOpenFoodFacts(json,barcode){
  const p=json&&json.product;if(!p||json.status===0)return null;
  const n=p.nutriments||{};let kcal=num(n['energy-kcal_100g']);
  if(kcal==null&&num(n.energy_100g)!=null)kcal=num(n.energy_100g)/4.184;
  const protein=num(n.proteins_100g);if(kcal==null||protein==null)return null;
  const name=cleanName(p.product_name_de||p.product_name||p.generic_name||'Produkt '+barcode),brand=cleanName(p.brands||'');
  return {id:'off-'+barcode,barcode:String(barcode),name,brand,source:'openfoodfacts',confidence:'etikett',
   per100:{kcal:round(kcal),protein:round(protein),carbs:round(num(n.carbohydrates_100g)||0),fat:round(num(n.fat_100g)||0),fiber:round(num(n.fiber_100g)||0)},
   defaultG:grams(p.serving_size)||null,aliases:aliasesFor(name,brand)};
 }
 /* Validates a food the user entered herself. Throws a readable message. */
 function own(fields,id){
  const name=cleanName(fields.name);if(!name)throw Error('Wie heißt das Lebensmittel?');
  const basis=fields.basis==='piece'?'piece':'100g',values={};
  for(const k of NUTRIENTS){const v=num(fields[k]);if(v!=null&&v<0)throw Error('Werte dürfen nicht negativ sein.');values[k]=v==null?0:round(v)}
  if(num(fields.kcal)==null||num(fields.protein)==null)throw Error('Bitte mindestens kcal und Protein eintragen.');
  if(basis==='100g'&&(values.kcal>950||values.protein+values.carbs+values.fat>101))throw Error('Diese Werte sind für 100 g nicht möglich. Bitte prüfen.');
  const defaultG=num(fields.defaultG);if(defaultG!=null&&(defaultG<=0||defaultG>2000))throw Error('Die Portion sollte zwischen 1 und 2000 g liegen.');
  const extra=String(fields.aliases||'').split(',');
  const food={id:id||'own-'+Date.now().toString(36),name,source:'own',confidence:'gespeichert',aliases:aliasesFor(name,'',extra)};
  if(basis==='piece')food.perPiece=values;else{food.per100=values;if(defaultG)food.defaultG=defaultG}
  if(fields.barcode)food.barcode=String(fields.barcode).replace(/\D/g,'');
  return food;
 }
 function portion(food,amount){
  const base=food.perPiece||food.per100,factor=food.perPiece?amount:amount/100,out={};
  for(const k of NUTRIENTS)out[k]=round((base[k]||0)*factor);return out;
 }
 const validBarcode=code=>/^\d{8}$|^\d{12,14}$/.test(String(code||''));
 return {NUTRIENTS,fromOpenFoodFacts,own,portion,grams,validBarcode};
});

