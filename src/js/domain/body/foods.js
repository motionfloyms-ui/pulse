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
 /* Amounts in everyday German: 150 g, 0,5 kg, 250 ml, 2 EL, eine Handvoll, 2 Scheiben, zwei Bananen,
    eine halbe Pizza, 2 Portionen. Without an amount the usual portion applies. */
 const WORDNUM={ein:1,eine:1,einen:1,einem:1,eins:1,zwei:2,drei:3,vier:4,'fünf':5,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,halb:.5,halbe:.5,halber:.5,halbes:.5,halben:.5,anderthalb:1.5,eineinhalb:1.5};
 const N='(\\d+(?:[.,]\\d+)?|'+Object.keys(WORDNUM).sort((a,b)=>b.length-a.length).join('|')+')';
 const qty=s=>{s=String(s).toLocaleLowerCase('de');return Object.hasOwn(WORDNUM,s)?WORDNUM[s]:Number(s.replace(',','.'))};
 const de=n=>String(Math.round(n*10)/10).replace('.',',');
 const UNITS=[['kg|kilo',{g:1000}],['g|gramm',{g:1}],['ml|milliliter',{g:1,ml:true}],['l|liter',{g:1000,ml:true}],['el|esslöffel',{g:15,unit:'EL'}],['tl|teelöffel',{g:5,unit:'TL'}],['handvoll|hand voll',{g:30,unit:'Handvoll'}],['portionen|portion|teller|schüsseln|schüssel|schalen|schale',{portion:true}],['scheiben|scheibe',{count:true,unit:'Scheibe'}],['x|stück|stueck|stk',{count:true}]];
 function measure(text,food){
  const t=(' '+String(text||'').toLocaleLowerCase('de')+' ').replace(/(\s)(?:ein|eine|einen|einem)\s+(?=halb)/g,'$1');
  for(const [words,u] of UNITS){const m=t.match(new RegExp('(?:^|[^\\p{L}\\d])'+N+'\\s*(?:'+words+')(?![\\p{L}])','u'));if(m){const q=qty(m[1]);if(u.g)return {grams:q*u.g,ml:!!u.ml,unit:u.unit,q};if(u.portion)return {portions:q};return {count:q,unit:u.unit}}}
  const bare=t.match(new RegExp('(?:^|\\s)'+N+'\\s+(?!g\\b|ml\\b)\\S','u'));
  if(bare)return (food.perPiece||food.pieceG)?{count:qty(bare[1])}:{portions:qty(bare[1])};
  return {};
 }
 const scale=(base,f)=>{const o={};for(const k of NUTRIENTS)o[k]=round((base[k]||0)*f);return o};
 function nutrition(food,text){
  const m=measure(text,food),per=food.per100,piece=food.perPiece;
  const byGrams=(g,label)=>!(g>0)?{error:'Menge prüfen'}:per?{nut:scale(per,g/100),amount:g,label}:{error:'Wie viele Stück?'};
  if(m.grams!=null){const base=m.ml&&food.per100Ml?food.per100Ml:per;if(!(m.grams>0))return {error:'Menge prüfen'};if(!base)return {error:'Wie viele Stück?'};return {nut:scale(base,m.grams/100),amount:m.grams,label:m.unit?de(m.q)+' '+m.unit+' (≈ '+de(m.grams)+' g)':de(m.grams)+(m.ml?' ml':' g')}}
  if(m.count!=null){if(!(m.count>0))return {error:'Stückzahl prüfen'};
   if(piece)return {nut:scale(piece,m.count),amount:m.count,label:de(m.count)+' Stück'};
   if(food.pieceG)return byGrams(m.count*food.pieceG,de(m.count)+' '+(m.unit==='Scheibe'?(m.count<=1?'Scheibe':'Scheiben'):'Stück')+' (≈ '+de(m.count*food.pieceG)+' g)');
   if(food.defaultG)return byGrams(m.count*food.defaultG,de(m.count)+(m.count<=1?' Portion':' Portionen')+' (≈ '+de(m.count*food.defaultG)+' g)');
   return {error:'Welche Menge in Gramm?'}}
  if(m.portions!=null){if(!(m.portions>0))return {error:'Menge prüfen'};
   if(food.defaultG)return byGrams(m.portions*food.defaultG,de(m.portions)+(m.portions<=1?' Portion':' Portionen')+' (≈ '+de(m.portions*food.defaultG)+' g)');
   if(piece)return {nut:scale(piece,m.portions),amount:m.portions,label:de(m.portions)+' Stück'};
   if(food.pieceG)return byGrams(m.portions*food.pieceG,de(m.portions)+' Stück (≈ '+de(m.portions*food.pieceG)+' g)');
   return {error:'Welche Menge in Gramm?'}}
  if(food.defaultG&&per)return byGrams(food.defaultG,'übliche Portion (≈ '+de(food.defaultG)+' g)');
  if(piece)return {nut:scale(piece,1),amount:1,label:'1 Stück'};
  return {error:'Welche Menge?'};
 }
 return {NUTRIENTS,fromOpenFoodFacts,own,portion,grams,validBarcode,measure,nutrition};
});

