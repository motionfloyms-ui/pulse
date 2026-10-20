// SOURCE: domain/brain/parser.js
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseCapture=api})(globalThis,function(){
 const norm=t=>t.toLowerCase().replace(/ü/g,'ue').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ß/g,'ss');
 function relative(text,date,offset){const t=norm(text);if(/\buebermorgen\b/.test(t))return offset(date,2);if(/\bmorgen\b/.test(t))return offset(date,1);if(/naechste woche/.test(t))return offset(date,7);if(/\bheute\b/.test(t))return date;return null}
 function interpret(text,date,offset){
  const raw=(text||'').trim(),low=norm(raw),due=relative(raw,date,offset);
  const taskVerb=/\b(kaufen|anrufen|erinner\w*|termin|muss|todo|to-do|bestellen|abholen|bezahlen|schreiben|erledigen)\b/.test(low);
  const future=due&&due>date;
  if(taskVerb||future)return {raw,type:'task',domain:'brain',due,confidence:'derived'};
  if(/gestern|vorgestern|letzte woche|am\s+\d{1,2}[./]/.test(low))return {raw,type:'historical-review',domain:'brain',due:null,confidence:'unclear'};
  if(/wieder fit|nicht mehr krank|mir geht es wieder gut/.test(low))return {raw,type:'context-clear',domain:'body',due:null,confidence:'confirmed'};
  if(/(?:keine?|nicht) (?:schmerzen|beschwerden|uebel|krank|erschoepft)/.test(low))return {raw,type:'context',domain:'body',due:null,confidence:'derived'};
  if(/periode|zyklus|schmerz|uebel|erbrechen|erschoepft|recovery|krank/.test(low))return {raw,type:/stark|schlimm|heftig|erbrechen|erschoepft|recovery|krank/.test(low)?'recovery':'context',domain:'body',due:null,confidence:'derived'};
  if(/\b(getrunken|wasser|mineralwasser|leitungswasser|sprudelwasser|kaffee|coffee|cappuccino|espresso|latte|tee|cola|limonade|saft|milch|haferdrink|sojadrink|energy|energydrink|proteinshake|smoothie|bier|wein|getraenk)\b/.test(low))return {raw,type:'drink',domain:'body',due:null,confidence:'derived'};
  if(/glute|leg press|beinpresse|latzug|rudern|schulterpresse|brustpresse|beinbeuger|abduktor|rueckenstreck|seit(?:en)?heben|bauchmaschine|trizeps|training|wiederhol|\bwdh\b|\bsatz\b/.test(low))return {raw,type:'workout',domain:'body',due:null,confidence:'derived'};
  if(/\b(skyr|quark|whey|gegessen|getrunken|protein|kcal|kalorien|tofu|ei|eier|huettenkaese)\b/.test(low))return {raw,type:'food',domain:'body',due:null,confidence:'derived'};
  return {raw,type:'note',domain:'brain',due:null,confidence:'unclear'};
 }
 function workout(raw){
  let text=norm(raw);const words={eins:1,eine:1,einen:1,zwei:2,drei:3,vier:4,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,elf:11,zwoelf:12,dreizehn:13,vierzehn:14,fuenfzehn:15,sechzehn:16,siebzehn:17,achtzehn:18,neunzehn:19,zwanzig:20};
  const tens={zwanzig:20,dreissig:30,vierzig:40,fuenfzig:50,sechzig:60,siebzig:70,achtzig:80,neunzig:90},units={ein:1,eins:1,zwei:2,drei:3,vier:4,fuenf:5,sechs:6,sieben:7,acht:8,neun:9};
  text=text.replace(/\b(ein|zwei|drei|vier|fuenf|sechs|sieben|acht|neun)und(zwanzig|dreissig|vierzig|fuenfzig|sechzig|siebzig|achtzig|neunzig)\b/g,(_,u,t)=>String(units[u]+tens[t]));
  text=text.replace(/\b(hundert|einhundert)\b/g,'100').replace(/\b\w+\b/g,w=>Object.hasOwn(tens,w)?String(tens[w]):Object.hasOwn(words,w)?String(words[w]):w);
  text=text.replace(/(\d+)\s*(?:komma|,)\s*(\d+)/g,'$1.$2').replace(/(\d+)\s*einhalb\b/g,'$1.5');
  const kg=text.match(/(-?\d+(?:[,.]\d+)?)\s*(?:kg|kilo)/),reps=text.match(/(-?\d+)\s*(?:wdh|wiederhol\w*|reps?)/);
  const map=[['glute','Glute Drive (Lady Gym)'],['beinpresse','Beinpresse (07)'],['leg press','Beinpresse (07)'],['latzug','Latzug (05)'],['rudern','Rudern sitzend (03)'],['schulterpresse','Schulterpresse'],['abduktor','Abduktoren'],['rueckenstreck','Rückenstreckung (13)'],['seitheben','Seitheben Kurzhanteln'],['seitenheben','Seitheben Kurzhanteln'],['bauchmaschine','Bauchmaschine I (24)']];
  return {exercise:map.find(([w])=>text.includes(w))?.[1]||null,kg:kg&&Number(kg[1].replace(',','.'))>0?Number(kg[1].replace(',','.')):null,reps:reps&&Number(reps[1])>0?Number(reps[1]):null};
 }
 const WEEKDAYS={sonntag:0,montag:1,dienstag:2,mittwoch:3,donnerstag:4,freitag:5,samstag:6};
 function validDate(d){if(!/^\d{4}-\d{2}-\d{2}$/.test(d))return false;const x=new Date(d+'T12:00:00Z');return !Number.isNaN(x.getTime())&&x.toISOString().slice(0,10)===d}
 /* Date and time in everyday German: "morgen", "Freitag", "am 24.10.", "um 15 Uhr", "18:30". */
 function when(text,date,offset){
  const t=norm(text||'');let day=relative(text||'',date,offset)||'',time='';
  const dm=t.match(/\b(?:am\s+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?!\d)/);
  if(dm){const y=dm[3]?(dm[3].length===2?'20'+dm[3]:dm[3]):date.slice(0,4);let d=y+'-'+dm[2].padStart(2,'0')+'-'+dm[1].padStart(2,'0');if(!dm[3]&&d<date)d=String(Number(y)+1)+d.slice(4);if(validDate(d))day=d}
  if(!day)for(const [name,n] of Object.entries(WEEKDAYS))if(new RegExp('\\b'+name+'s?\\b').test(t)){const cur=new Date(date+'T12:00:00').getDay();let diff=(n-cur+7)%7;if(diff===0)diff=7;day=offset(date,diff);break}
  const tm=t.match(/\b(?:um\s+)?([01]?\d|2[0-3])(?::([0-5]\d)|\s*uhr(?:\s*([0-5]\d))?)(?!\d)/)||t.match(/\bum\s+([01]?\d|2[0-3])\b/);
  if(tm)time=tm[1].padStart(2,'0')+':'+(tm[2]||tm[3]||'00');
  return {date:day,time};
 }
 return {interpret,relative,workout,when};
});


