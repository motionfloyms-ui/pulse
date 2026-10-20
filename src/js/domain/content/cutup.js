// SOURCE: domain/content/cutup.js
/* Cut-up (Brion Gysin, William S. Burroughs): cut a text into fragments and recombine them. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseCutup=api})(globalThis,function(){
 'use strict';
 function rng(seed){let a=seed>>>0;return ()=>{a=a+0x6D2B79F5|0;let t=Math.imul(a^a>>>15,1|a);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296}}
 /* size: 'klein' (1–2 words), 'mittel' (2–4), 'zeilen' (half lines) */
 function fragments(text,size='mittel',seed=1){
  const R=rng(seed),lines=String(text||'').split(/\n+/).map(l=>l.replace(/[„“"»«]/g,'').trim()).filter(Boolean),out=[];
  for(const line of lines){
   const words=line.split(/\s+/).filter(Boolean);if(!words.length)continue;
   if(size==='zeilen'){if(words.length<=4){out.push(words.join(' '));continue}const cut=Math.max(2,Math.min(words.length-2,Math.round(words.length/2+(R()-.5)*3)));out.push(words.slice(0,cut).join(' '),words.slice(cut).join(' '));continue}
   const [lo,hi]=size==='klein'?[1,2]:[2,4];let i=0;while(i<words.length){const n=lo+Math.floor(R()*(hi-lo+1));out.push(words.slice(i,i+n).join(' '));i+=n}
  }
  return out.map(s=>s.replace(/^[,.;:!?–-]+|[,;:–-]+$/g,'').trim()).filter(s=>s.length>1);
 }
 /* New lines from shuffled fragments: `count` lines of 2–3 fragments, never the original neighbour twice in a row. */
 function lines(text,{size='mittel',seed=1,count=12}={}){
  const R=rng(seed^0x5bd1e995),frags=fragments(text,size,seed);if(frags.length<2)return frags.slice();
  const bag=()=>{const a=frags.map((f,i)=>({f,i}));for(let i=a.length-1;i>0;i--){const j=Math.floor(R()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a};
  const out=[];let pool=bag();
  for(let n=0;n<count;n++){
   const k=size==='zeilen'?2:2+Math.floor(R()*2),parts=[];
   let tries=0;while(parts.length<k){if(!pool.length)pool=bag();const p=pool.pop();if(parts.length&&Math.abs(parts[parts.length-1].i-p.i)===1&&pool.length&&tries++<6){pool.unshift(p);continue}parts.push(p)}
   let s=parts.map(p=>p.f).join(' ');s=s.charAt(0).toLocaleUpperCase('de')+s.slice(1);out.push(s);
  }
  return [...new Set(out)];
 }
 return {fragments,lines};
});
