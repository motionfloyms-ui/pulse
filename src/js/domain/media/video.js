// SOURCE: domain/media/video.js
/* YouTube links: recognise them and build the privacy-friendly embed address (youtube-nocookie). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseVideo=api})(globalThis,function(){
 'use strict';
 const ID=/^[A-Za-z0-9_-]{11}$/;
 const HOSTS=/^(?:www\.|m\.|music\.)?(?:youtube\.com|youtube-nocookie\.com)$/;
 /* "1h2m3s", "90", "2m" → seconds */
 function seconds(t){t=String(t||'');if(/^\d+$/.test(t))return Number(t);const m=t.match(/^(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s)?$/);return m&&t?(Number(m[1]||0)*3600+Number(m[2]||0)*60+Number(m[3]||0)):0}
 function parse(url){
  let u;try{u=new URL(String(url||'').trim())}catch(_){return null}
  if(!/^https?:$/.test(u.protocol))return null;
  const host=u.hostname.toLowerCase();let id='';
  if(host==='youtu.be')id=u.pathname.split('/')[1]||'';
  else if(HOSTS.test(host)){
   if(u.pathname==='/watch')id=u.searchParams.get('v')||'';
   else{const m=u.pathname.match(/^\/(?:shorts|embed|live|v)\/([^/?#]+)/);if(m)id=m[1]}
  }
  if(!ID.test(id))return null;
  const start=seconds(u.searchParams.get('t')||u.searchParams.get('start')||'');
  return {id,start,short:u.pathname.startsWith('/shorts/'),music:host.startsWith('music.')};
 }
 function find(text){for(const m of String(text||'').matchAll(/https?:\/\/[^\s<>"']+/g)){const v=parse(m[0]);if(v)return {...v,url:m[0]}}return null}
 function embed(v,autoplay=true){return 'https://www.youtube-nocookie.com/embed/'+v.id+'?rel=0&playsinline=1&modestbranding=1'+(autoplay?'&autoplay=1':'')+(v.start?'&start='+v.start:'')}
 function watch(v){return 'https://www.youtube.com/watch?v='+v.id+(v.start?'&t='+v.start+'s':'')}
 /* Room suggestion from the title or shared text. Empty when nothing fits; the user decides. */
 const ROOMS=[
  ['koerper',/training|workout|übung|uebung|exercise|gym|fitx|kraft|squat|kniebeuge|bankdr|latzug|rudern|kreuzheben|deadlift|hip ?thrust|glute|dehn|stretch|mobility|yoga|pilates|rezept|recipe|kochen|cooking|protein|ernährung|meal ?prep/],
  ['ideen',/song|gesang|singen|sing|vocal|stimme|growl|scream|band|gitarre|guitar|bass|drum|lyric|songwriting|songtext|cover|musik|music|album|konzert|recording|mixing|schreiben|writing|vortrag|lecture|talk|doku|documentary|podcast|interview|bewusstsein|consciousness|levin/],
  ['sinn',/tarot|ritual|meditation|meditat|magick|magie|chaos ?magic|sigil|mond|moon|astrolog|spirit|hexe|witch|occult|okkult|pagan|samhain|wicca|gnosis|breathwork/],
  ['innen',/angst|anxiety|therapie|therapy|dissozi|dissociat|adhs|adhd|autis|neurodiver|selbstfürsorge|self[- ]care|grounding|achtsam|mindful|journaling/],
  ['zuhause',/putzen|cleaning|aufräum|declutter|organi[sz]|deko|diy|zimmerpflanze|houseplant/],
  ['draussen',/wandern|hiking|garten|garden|vögel|birds|natur|nature walk/]
 ];
 function room(text,video){
  const t=String(text||'').toLocaleLowerCase('de');let best='',n=0;
  for(const [id,re] of ROOMS){const c=(t.match(new RegExp(re.source,'g'))||[]).length;if(c>n){best=id;n=c}}
  return best||(video&&video.music?'ideen':'');
 }
 return {parse,find,embed,watch,seconds,room};
});
