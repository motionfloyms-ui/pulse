// SOURCE: domain/body/drinks.js
/* Explicit volume only. A glass/cup is not a measurement; no nutrient guesses. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseDrinks=api})(globalThis,function(){
  function parse(raw,foods=[]){
    const original=String(raw||'').trim(),text=original.toLowerCase().replace(/(\d),(\d)/g,'$1.$2');
    let measurable=text.replace(/\b(?:ein(?:en|em|e)?\s+)?halb(?:en|er|es)?\s+liter\b/g,'0.5 l').replace(/\bein(?:en|em)?\s+liter\b/g,'1 l');
    const quantities=[...measurable.matchAll(/(-?\d+(?:\.\d+)?)\s*(milliliter|millilitre|ml|zentiliter|cl|deziliter|dl|liters?|litres?|l)\b/gi)];
    if(quantities.length!==1)return {ok:false,reason:quantities.length>1?'Bitte eine eindeutige Gesamtmenge angeben.':'Wie viel war es in ml oder l? Die Größe eines Glases kenne ich nicht.'};
    const q=quantities[0],unit=q[2].toLowerCase(),factor=/^(ml|millil)/.test(unit)?1:/^(cl|zentil)/.test(unit)?10:/^(dl|dezil)/.test(unit)?100:1000;
    const ml=Math.round(Number(q[1])*factor*1000)/1000;
    if(!Number.isFinite(ml)||ml<=0)return {ok:false,reason:'Bitte eine positive Menge in ml oder l angeben.'};
    const name=measurable.replace(/\b(?:ich|habe|hab|gerade|heute|einen|eine|ein|getrunken|glas|tasse|flasche)\b/gi,'').replace(/(-?\d+(?:[.,]\d+)?)\s*(milliliter|ml|cl|dl|liter|l)\b/gi,'').replace(/[.!]+$/,'').replace(/\s+/g,' ').trim()||'Getränk';
    const plainWater=/^(?:(?:stilles?|kaltes?|warmes?)\s+)?(?:mineralwasser|leitungswasser|sprudelwasser|wasser)$/i.test(name);
    const food=foods.find(f=>f.per100Ml&&(f.aliases||[f.name]).some(a=>{const escaped=String(a).toLowerCase().replace(/[.*+?^${}()|[\]\\]/g,'\\$&');return new RegExp('(^|[^\\p{L}])'+escaped+'($|[^\\p{L}])','u').test(text)}));
    let nutrition=null;
    if(food){const n=food.per100Ml;if(['kcal','protein'].every(k=>Number.isFinite(n[k])&&n[k]>=0)){nutrition={};for(const k of ['kcal','protein','carbs','fat','fiber'])nutrition[k]=Number.isFinite(n[k])&&n[k]>=0?Math.round(n[k]*ml/100*10)/10:null}}
    return {ok:true,name:food?.name||name,ml,waterMl:plainWater?ml:0,nutrition,confidence:food?'label-based':'quantity-confirmed',rawText:original};
  }
  return {parse};
});


