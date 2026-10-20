// SOURCE: ui/voice.js
/* Dictation. Chrome on Android duplicates words in continuous mode, so each utterance is its own
   short recognition; the session restarts itself after every pause until the user taps stop. */
let pulseRecognition=null,pulseDictation=null;
function pulseSpeechSupported(){return !!(globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition)}
function pulseStopDictation(){if(pulseDictation){pulseDictation.stopped=true;try{pulseRecognition?.stop()}catch(_){}}}
function pulseMicState(targetId,on){
 document.querySelectorAll('.life-mic').forEach(b=>{const mine=b.dataset.target===targetId;b.classList.toggle('listening',on&&mine);b.setAttribute('aria-pressed',String(on&&mine));const label=b.querySelector('span');if(label)label.textContent=on&&mine?'Ich höre zu · tippen zum Beenden':'Sprechen'});
}
function pulseDictate(targetId){
 const SR=globalThis.SpeechRecognition||globalThis.webkitSpeechRecognition;
 if(!SR)return toast('Spracheingabe kann dieser Browser nicht. In Chrome klappt es.');
 if(pulseDictation){pulseStopDictation();return}
 const field=document.getElementById(targetId);if(!field)return;
 const s={targetId,stopped:false,silent:0,rounds:0,text:field.value.replace(/\s+$/,'')};
 pulseDictation=s;pulseMicState(targetId,true);
 const write=extra=>{field.value=(s.text&&extra?s.text+' ':s.text)+extra;field.dispatchEvent(new Event('input',{bubbles:true}))};
 const shape=t=>{t=t.trim();if(!t)return t;const sentenceStart=!s.text||/[.!?:\n]$/.test(s.text);return sentenceStart?t[0].toLocaleUpperCase('de')+t.slice(1):t};
 const finish=()=>{if(pulseDictation!==s)return;pulseDictation=null;pulseRecognition=null;pulseMicState(targetId,false);if(activeDialog)write('')};
 const round=()=>{
  if(s.stopped)return finish();
  const rec=new SR();rec.lang='de-DE';rec.interimResults=true;rec.continuous=false;rec.maxAlternatives=1;pulseRecognition=rec;
  let heard='';
  rec.onresult=e=>{let t='';for(let i=0;i<e.results.length;i++)t+=e.results[i][0].transcript;heard=shape(t);if(heard)s.silent=0;write(heard)};
  rec.onerror=e=>{
   if(e.error==='no-speech'){s.silent++;return}
   if(e.error==='aborted')return;
   s.stopped=true;toast(e.error==='not-allowed'||e.error==='service-not-allowed'?'PULSE darf das Mikrofon noch nicht nutzen. Erlaube es in den Website-Einstellungen von Chrome.':e.error==='network'?'Spracheingabe braucht eine Internetverbindung.':'Spracheingabe wurde unterbrochen. Tipp nochmal aufs Mikrofon.');
  };
  rec.onend=()=>{
   if(heard){s.text=(s.text?s.text+' ':'')+heard;heard=''}
   write('');
   if(!s.stopped&&s.silent<2&&++s.rounds<80)setTimeout(round,150);else finish();
  };
  try{rec.start()}catch(_){finish()}
 };
 round();
}
function lifeComposeVoice(){lifeQuick(true)}

