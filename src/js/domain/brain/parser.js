// SOURCE: domain/brain/parser.js
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseCapture=api})(globalThis,function(){
 const norm=t=>t.toLowerCase().replace(/ü/g,'ue').replace(/ä/g,'ae').replace(/ö/g,'oe').replace(/ß/g,'ss');
 function relative(text,date,offset){const t=norm(text);if(/\buebermorgen\b/.test(t))return offset(date,2);if(/\bmorgen\b/.test(t))return offset(date,1);if(/naechste woche/.test(t))return offset(date,7);if(/\bheute\b/.test(t))return date;return null}
 /* A dated entry is a look back only when it says so: a past year ("am 3.5.2025") or past tense
    ("am 3.10. war ich beim Arzt"). "Zahnarzt am 23.10." is a plan. */
 function pastDate(low,date){
  const y=low.match(/\b(\d{1,2})\.(\d{1,2})\.(\d{4}|\d{2})(?!\d)/);
  if(y){const year=y[3].length===2?'20'+y[3]:y[3],d=year+'-'+y[2].padStart(2,'0')+'-'+y[1].padStart(2,'0');if(d<date)return true}
  return /\b(war|waren|warst|hatte|hatten|gewesen|gehabt|gemacht|erledigt|gegangen|getroffen|besucht|gegessen|getrunken|trainiert|geschafft|gekauft)\b/.test(low);
 }
 function interpret(text,date,offset){
  const raw=(text||'').trim(),low=norm(raw),due=relative(raw,date,offset);
  const taskVerb=/\b(kaufen|anrufen|erinner\w*|termin|muss|todo|to-do|bestellen|abholen|bezahlen|schreiben|erledigen)\b/.test(low);
  const future=due&&due>date;
  if(taskVerb||future)return {raw,type:'task',domain:'brain',due,confidence:'derived'};
  if(/gestern|vorgestern|letzte woche/.test(low)||(/am\s+\d{1,2}[./]/.test(low)&&pastDate(low,date)))return {raw,type:'historical-review',domain:'brain',due:null,confidence:'unclear'};
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
 const pad=n=>String(n).padStart(2,'0');
 /* Month names in normalized text (umlauts written out): "3. Mai", "24. Dez.", "1. Maerz 2027". */
 const MONTH_N='(januar|jaenner|jan|februar|feb|maerz|maer|mrz|april|apr|mai|juni|jun|juli|jul|august|aug|september|sept|sep|oktober|okt|november|nov|dezember|dez)';
 const monthNo=m=>m.startsWith('mai')?5:m.startsWith('jul')?7:m.startsWith('jun')?6:m.startsWith('ma')||m==='mrz'?3:{ja:1,fe:2,ap:4,au:8,se:9,ok:10,no:11,de:12}[m.slice(0,2)];
 /* Day and month (and maybe year) to a date; without a year a past day means next year. */
 function dayOf(d,m,y,date){
  const year=y?(String(y).length===2?'20'+y:String(y)):date.slice(0,4);let out=year+'-'+pad(m)+'-'+pad(d);
  if(!y&&out<date)out=String(Number(year)+1)+out.slice(4);
  return validDate(out)?out:'';
 }
 /* Date and time in everyday German: "morgen", "Freitag", "am 24.10.", "3. Mai", "um 15 Uhr", "18:30",
    "19–21 Uhr", "7 Uhr abends". `end` is the end of a time span or ''. */
 function when(text,date,offset){
  const t=norm(text||'');let day=relative(text||'',date,offset)||'',time='',end='';
  const dm=t.match(/\b(?:am\s+)?(\d{1,2})\.(\d{1,2})\.(\d{2,4})?(?!\d)/);
  if(dm){const d=dayOf(dm[1],dm[2],dm[3],date);if(d)day=d}
  else{const mn=t.match(new RegExp('(?:^|[^a-z\\d])(\\d{1,2})\\.?\\s*'+MONTH_N+'\\.?(?:\\s+(\\d{4}))?(?![a-z\\d])'));if(mn){const d=dayOf(mn[1],monthNo(mn[2]),mn[3],date);if(d)day=d}}
  if(!day)for(const [name,n] of Object.entries(WEEKDAYS))if(new RegExp('\\b'+name+'s?\\b').test(t)){const cur=new Date(date+'T12:00:00').getDay();let diff=(n-cur+7)%7;if(diff===0)diff=7;day=offset(date,diff);break}
  const range=[...t.matchAll(/\b(von\s+)?([01]?\d|2[0-3])(?::([0-5]\d))?\s*(?:uhr\s*)?(?:-|–|—|bis)\s*([01]?\d|2[0-3])(?::([0-5]\d))?\s*(uhr)?(?!\d|\.\d)/g)].find(h=>h[1]||h[3]||h[5]||h[6]);
  if(range){time=pad(range[2])+':'+(range[3]||'00');end=pad(range[4])+':'+(range[5]||'00')}
  else{
   const tm=t.match(/\b(?:um\s+)?([01]?\d|2[0-3])(?::([0-5]\d)|\.([0-5]\d)\s*uhr|\s*uhr(?:\s*([0-5]\d))?)(?!\d)/)||t.match(/\bum\s+([01]?\d|2[0-3])\b/);
   if(tm)time=pad(tm[1])+':'+(tm[2]||tm[3]||tm[4]||'00');
  }
  if(time&&/\b(abends?|nachmittags?)\b/.test(t)){const pm=v=>{const h=Number(v.slice(0,2));return h>=1&&h<12?pad(h+12)+v.slice(2):v};time=pm(time);if(end)end=pm(end)}
  return {date:day,time,end};
 }
 /* ---------- Series and clean titles. These work on the original text (lower-cased with the same
    length), so recognised phrases can be cut out of what the person typed. ---------- */
 // Word edges; a word glued to a hyphen ("Freitags-Playlist") is part of a compound, not a time word.
 const B='(?<![\\p{L}\\d])',E='(?![\\p{L}\\d]|-\\p{L})',R=s=>new RegExp(s,'gu');
 const lower=s=>Array.from(String(s||''),c=>{const l=c.toLowerCase();return l.length===c.length?l:c}).join('');
 const DAYS='montag|dienstag|mittwoch|donnerstag|freitag|samstag|sonnabend|sonntag';
 const DAYNO={montag:1,dienstag:2,mittwoch:3,donnerstag:4,freitag:5,samstag:6,sonnabend:6,sonntag:0,mo:1,di:2,mi:3,do:4,fr:5,sa:6,so:0};
 const NUMRE='(\\d{1,3}|zwei|drei|vier|f(?:ü|ue)nf|sechs|sieben|acht|neun|zehn|elf|zw(?:ö|oe)lf)';
 const NUMW={zwei:2,drei:3,vier:4,'fünf':5,fuenf:5,sechs:6,sieben:7,acht:8,neun:9,zehn:10,elf:11,'zwölf':12,zwoelf:12,ein:1,eine:1,einen:1,einer:1};
 const num=s=>/^\d/.test(s)?Number(s):NUMW[s]||0;
 const ORDRE='(erste[nrs]?|1\\.|zweite[nrs]?|2\\.|dritte[nrs]?|3\\.|vierte[nrs]?|4\\.|letzte[nrs]?)';
 const ordNo=s=>s.startsWith('letzt')?-1:/^(erst|1)/.test(s)?1:/^(zweit|2)/.test(s)?2:/^(dritt|3)/.test(s)?3:4;
 const MONTH_L='(januar|j(?:ä|ae)nner|jan|februar|feb|m(?:ä|ae)rz|m(?:ä|ae)r|mrz|april|apr|mai|juni|jun|juli|jul|august|aug|september|sept|sep|oktober|okt|november|nov|dezember|dez)';
 const UNIT={t:'daily',w:'weekly',m:'monthly',j:'yearly'};
 /* Cuts spans out of `src` and tidies what is left (loose commas, dangling "und", "am", "um" …). */
 function cutOut(src,cuts){
  let out='',p=0;for(const [a,b] of [...cuts].sort((x,y)=>x[0]-y[0])){if(a<p)continue;out+=src.slice(p,a)+' ';p=b}out+=src.slice(p);
  let prev;do{prev=out;out=out.replace(/[ \t]+/g,' ').replace(/ ([,.;:!?])/g,'$1').replace(/^[\s,;:–—+&/-]+|[\s,;:–—+&/-]+$/g,'').replace(/(^|\s)(?:und|sowie|am|um|ab|bis|von|immer|jeweils|jeden|jede)$/i,'').replace(/^(?:und|sowie|am|um|ab)(?=\s)/i,'')}while(out!==prev);
  return out.trim();
 }
 function scanner(t){
  const cuts=[],free=(a,b)=>!cuts.some(([x,y])=>a<y&&x<b);
  const scan=(re,fn)=>{let hit=false;for(const h of t.matchAll(re)){const a=h.index,b=a+h[0].length;if(!free(a,b))continue;if(fn(h,a)!==false){cuts.push([a,b]);hit=true}}return hit};
  return {cuts,scan};
 }
 /* A repeating rule in everyday German, e.g. "jeden Dienstag", "dienstags und donnerstags",
    "alle 2 Wochen", "jeden zweiten Tag", "werktags", "am ersten Montag im Monat", "jeden 15.",
    "jährlich", plus an end: "bis 20.12.", "bis Ende Juni", "10-mal", "für 6 Wochen".
    Returns null or {rule, rest, phrase}; `rest` is the text without the series words, ready for
    when() (start date "ab 3.11.", time) and for the title. Only what is clearly a series counts:
    a plain "Dienstag" stays a single date. */
 function repeat(text){
  const src=String(text||''),t=lower(src),{cuts,scan}=scanner(t);
  const r={freq:'',interval:1,byday:[],nth:0,dom:0,until:null,count:0,lasting:null,pm:false};
  const setF=(f,n=1)=>{if(!r.freq){r.freq=f;r.interval=n;return true}if(r.freq===f||(f==='monthly'&&r.freq==='monthlyNth')){if(n>1)r.interval=n;return true}return false};
  // Nth weekday of the month. "jeden zweiten Dienstag" without "im Monat" means every other week.
  scan(R(B+'(?:(jede[nmrs]?|immer|jeweils)\\s+(?:am\\s+)?|am\\s+)?'+ORDRE+'\\s+('+DAYS+')s?((?:\\s+(?:im|des|jeden|eines|pro)\\s+monats?)?)'+E),h=>{
   const lead=!!h[1],ord=ordNo(h[2]),w=DAYNO[h[3]],monthly=!!h[4];
   if(!lead&&!monthly)return false;
   if(ord===2&&!monthly){if(!setF('weekly',2))return false;r.byday.push(w);return true}
   if(r.freq&&r.freq!=='monthly'&&r.freq!=='monthlyNth')return false;
   r.interval=r.freq?r.interval:1;r.freq='monthlyNth';r.nth=ord;r.byday=[w];return true;
  });
  scan(R(B+'alle\\s+'+NUMRE+'\\s+(tage|wochen|monate|jahre)'+E),h=>setF(UNIT[h[2][0]],num(h[1])));
  scan(R(B+'jede[nmrs]?\\s+(zweite[nmrs]?|dritte[nmrs]?|vierte[nmrs]?|[2-9]\\.)\\s+(tag|woche|monat|jahr)'+E),h=>setF(UNIT[h[2][0]],/^\d/.test(h[1])?Number(h[1][0]):ordNo(h[1])));
  scan(R(B+'(?:(?:14|vierzehn)\\s*-?\\s*t(?:ä|ae)gig|zweiw(?:ö|oe)chentlich|zweiw(?:ö|oe)chig)'+E),()=>setF('weekly',2));
  scan(R(B+'(?:viertelj(?:ä|ae)hrlich|quartalsweise|jedes\\s+quartal)'+E),()=>setF('monthly',3));
  scan(R(B+'halbj(?:ä|ae)hrlich'+E),()=>setF('monthly',6));
  scan(R(B+'zweimonatlich'+E),()=>setF('monthly',2));
  scan(R(B+'(?:t(?:ä|ae)glich|allt(?:ä|ae)glich|jeden\\s+tag|jeden\\s+(morgen|vormittag|mittag|nachmittag|abend)|jede\\s+nacht)'+E),h=>{if(h[1]&&/nachmittag|abend/.test(h[1]))r.pm=true;return setF('daily')});
  scan(R(B+'(?:werktags|wochentags|jeden\\s+werktag|an\\s+werktagen|montags\\s*(?:bis|-|–)\\s*freitags|(?:jeden|immer)\\s+(?:montag|mo\\.?)\\s*(?:bis|-|–)\\s*(?:freitag|fr\\.?))'+E),()=>{if(r.freq&&r.freq!=='weekdays')return false;r.freq='weekdays';return true});
  scan(R(B+'(?:w(?:ö|oe)chentlich|jede\\s+woche|einmal\\s+(?:pro|die|in\\s+der)\\s+woche)'+E),()=>setF('weekly'));
  scan(R(B+'(?:monatlich|jeden\\s+monat|einmal\\s+(?:im|pro)\\s+monat)'+E),()=>setF('monthly'));
  scan(R(B+'(?:j(?:ä|ae)hrlich|allj(?:ä|ae)hrlich|jedes\\s+jahr|einmal\\s+(?:im|pro)\\s+jahr)'+E),()=>setF('yearly'));
  // "jeden 3. Mai", "jeden 24.12.": yearly; the date itself stays for when().
  scan(R(B+'jede[ns]?(?=\\s+\\d{1,2}\\.\\s*(?:\\d{1,2}\\.|'+MONTH_L+'))'),()=>setF('yearly'));
  // Day of the month: "jeden 15.", "monatlich am 15.", "am 15. jeden Monats", "zum Monatsanfang".
  scan(R(B+'(jeden|immer\\s+am|am)\\s+(\\d{1,2})\\.(?!\\s*(?:\\d{1,2}\\.(?!\\d{2}\\s*uhr)|'+MONTH_L+'))((?:\\s+(?:jeden|des|eines)\\s+monats)?)'+E),h=>{const d=Number(h[2]);if(d<1||d>31)return false;if(h[1]==='am'&&!h[3]&&r.freq!=='monthly')return false;if(!setF('monthly'))return false;r.dom=d;return true});
  scan(R(B+'(?:(?:am|zum|jeden)\\s+)?(?:monatsersten|monatsanfang|ersten\\s+(?:des|jeden|eines)\\s+monats|anfang\\s+(?:des|jeden|eines)\\s+monats)'+E),()=>{if(!setF('monthly'))return false;r.dom=1;return true});
  // Weekdays: "jeden Dienstag", "dienstags", "jeden Di und Do", "dienstags und freitags". A plain
  // "Dienstag" only joins a weekly rule that is already there ("alle 2 Wochen am Dienstag").
  const TOK='(?:(?:'+DAYS+')s?|(?:mo|di|mi|do|fr|sa|so)\\.?)',SEP='\\s*(?:,|und|&|\\+|/|sowie)\\s*(?:am\\s+)?';
  scan(R(B+'(?:(jede[nmrs]?|immer|jeweils)\\s+)?(am\\s+)?('+TOK+'(?:'+SEP+TOK+')*)'+E),(h,a)=>{
   const lead=!!h[1],list=h[3],at=a+h[0].length-list.length,days=[];let plural=false,full=false;
   for(const k of list.matchAll(R(B+'(?:('+DAYS+')(s?)|(mo|di|mi|do|fr|sa|so)\\.?)'+E))){
    if(k[1]){full=true;if(k[2])plural=true;days.push(DAYNO[k[1]])}
    else{if(!/[A-ZÄÖÜ]/.test(src[at+k.index]))return false;days.push(DAYNO[k[3]])}
   }
   if(!full&&!lead&&days.length<2)return false;
   if(lead||plural){if(r.freq&&r.freq!=='weekly')return false;if(!r.freq)r.freq='weekly'}
   else if(r.freq!=='weekly')return false;
   r.byday.push(...days);return true;
  });
  if(!r.freq)return null;
  // How long: "bis 20.12.", "bis zum 3. März 2027", "bis Ende Juni", "bis Jahresende", "10-mal", "für 6 Wochen".
  scan(R(B+'bis\\s+(?:zum\\s+|einschlie(?:ß|ss)lich\\s+|inkl\\.?\\s+)?(?:(?:mo|di|mi|do|fr|sa|so)\\.?,?\\s+)?(\\d{1,2})\\.(\\d{1,2})\\.(\\d{2,4})?(?!\\d)'),h=>{if(r.until)return false;r.until={d:+h[1],m:+h[2],y:h[3]?+(h[3].length===2?'20'+h[3]:h[3]):0}});
  scan(R(B+'bis\\s+(?:zum\\s+)?(\\d{1,2})\\.?\\s*'+MONTH_L+'\\.?(?:\\s+(\\d{4}))?'+E),h=>{if(r.until)return false;r.until={d:+h[1],m:monthNo(norm(h[2])),y:+h[3]||0}});
  scan(R(B+'bis\\s+ende\\s+'+MONTH_L+'\\.?(?:\\s+(\\d{4}))?'+E),h=>{if(r.until)return false;r.until={d:0,m:monthNo(norm(h[1])),y:+h[2]||0}});
  scan(R(B+'bis\\s+(?:zum\\s+)?(?:jahresende|ende\\s+des\\s+jahres|silvester)'+E),()=>{if(r.until)return false;r.until={d:31,m:12,y:0}});
  scan(R(B+NUMRE+'\\s*(?:-\\s*)?(?:mal|x)'+E+'(?!\\s+(?:pro|die|in|im|am|je|t(?:ä|ae)glich|w(?:ö|oe)chentlich|monatlich|j(?:ä|ae)hrlich)'+E+')'),h=>{const n=num(h[1]);if(r.count||n<2)return false;r.count=n});
  scan(R(B+'(?:insgesamt\\s+)?'+NUMRE+'\\s+termine'+E),h=>{const n=num(h[1]);if(r.count||n<1)return false;r.count=n});
  scan(R(B+'(?:f(?:ü|ue)r\\s+'+NUMRE+'\\s+(tage|wochen|monate|jahre)|'+NUMRE+'\\s+(tage|wochen|monate|jahre)\\s+lang)'+E),h=>{const n=num(h[1]||h[3]);if(!n||r.lasting)return false;r.lasting={n,unit:(h[2]||h[4])[0]}});
  r.byday=[...new Set(r.byday)];
  const phrase=[...cuts].sort((x,y)=>x[0]-y[0]).map(([a,b])=>src.slice(a,b).trim()).join(' ');
  return {rule:r,rest:cutOut(src,cuts),phrase};
 }
 const REMIND_UNITS='(min(?:uten?)?\\.?|std\\.?|stunden?|tage?n?)';
 const REMIND_NUM='(\\d{1,3}|eine[nr]?|ein|zwei|drei|vier|f(?:ü|ue)nf|sechs|zehn|zw(?:ö|oe)lf|zwanzig|drei(?:ß|ss)ig|f(?:ü|ue)nfzehn|f(?:ü|ue)nfundvierzig)';
 const REMIND_W={zwanzig:20,'dreißig':30,dreissig:30,'fünfzehn':15,fuenfzehn:15,'fünfundvierzig':45,fuenfundvierzig:45};
 /* Reminder wishes: "30 min vorher", "Erinnerung 1 Stunde vorher", "am Vortag erinnern", "mit Erinnerung".
    Returns {minutes} (or minutes:'default' when no amount is said) and the spans to cut, or null. */
 function remindSpans(t){
  const {cuts,scan}=scanner(t);let minutes=null;
  scan(R(B+'(?:(?:mit\\s+)?erinnerung|erinnere?\\s+mich|alarm)?\\s*'+REMIND_NUM+'\\s*'+REMIND_UNITS+'\\s+(?:vorher|davor|fr(?:ü|ue)her)(?:\\s+erinnern)?'+E),h=>{const n=REMIND_W[h[1]]??num(h[1]);if(!n&&n!==0)return false;const u=h[2][0];minutes=u==='m'?n:u==='s'?n*60:n*1440});
  if(minutes==null)scan(R(B+'(?:(?:mit\\s+)?erinnerung|erinnere?\\s+mich|erinnern)\\s+(?:mich\\s+)?(?:am\\s+vortag|einen\\s+tag\\s+vorher)|am\\s+vortag\\s+erinnern'+E),()=>{minutes=1440});
  if(minutes==null)scan(R(B+'(?:mit\\s+erinnerung|erinnere\\s+mich(?:\\s+daran)?|bitte\\s+erinnern)'+E),()=>{minutes='default'});
  return minutes==null?null:{minutes,cuts};
 }
 function remind(text){const x=remindSpans(lower(text));return x?x.minutes:null}
 /* The title without the date, time and reminder words: "Zahnarzt morgen um 15 Uhr" → "Zahnarzt".
    Falls back to the text itself when nothing would be left. */
 function strip(text){
  const src=String(text||''),t=lower(src),{cuts,scan}=scanner(t);
  const rem=remindSpans(t);if(rem)cuts.push(...rem.cuts);
  scan(R(B+'(?:ab\\s+)?(?:(?:ü|ue)bermorgen|morgen|heute)(?:\\s+(?:abend|nachmittag|vormittag|mittag|fr(?:ü|ue)h|nacht))?'+E),()=>true);
  scan(R(B+'(?:ab\\s+)?n(?:ä|ae)chste\\s+woche'+E),()=>true);
  scan(R(B+'(?:ab\\s+|am\\s+)?(?:(?:mo|di|mi|do|fr|sa|so)\\.?,?\\s+)?\\d{1,2}\\.\\d{1,2}\\.(?:\\d{2,4})?(?!\\d)'),()=>true);
  scan(R(B+'(?:ab\\s+|am\\s+)?\\d{1,2}\\.?\\s*'+MONTH_L+'\\.?(?:\\s+\\d{4})?'+E),()=>true);
  scan(R(B+'(?:ab\\s+|am\\s+|n(?:ä|ae)chsten\\s+|diesen\\s+|kommenden\\s+)?(?:'+DAYS+')s?'+E),()=>true);
  let timed=scan(R(B+'(von\\s+|ab\\s+|um\\s+)?\\d{1,2}(:\\d{2})?\\s*(uhr\\s*)?(?:-|–|—|bis)\\s*\\d{1,2}(:\\d{2})?\\s*(uhr)?(?!\\d|\\.\\d)'),h=>!!(h[1]&&/von/.test(h[1])||h[2]||h[3]||h[4]||h[5]));
  timed=scan(R(B+'(?:um\\s+|ab\\s+|gegen\\s+)?\\d{1,2}(?::\\d{2}(?:\\s*uhr)?|\\.\\d{2}\\s*uhr|\\s*uhr(?:\\s*\\d{2})?)'+E),()=>true)||timed;
  timed=scan(R(B+'um\\s+\\d{1,2}'+E),()=>true)||timed;
  if(timed)scan(R(B+'(?:abends|nachmittags|vormittags|morgens|am\\s+abend|am\\s+nachmittag|am\\s+vormittag)'+E),()=>true);
  return cutOut(src,cuts)||src.trim();
 }
 return {interpret,relative,workout,when,repeat,remind,strip,monthNo,MONTH_N};
});


