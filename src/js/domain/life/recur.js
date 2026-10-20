// SOURCE: domain/life/recur.js
/* Calendar rules for events: all-day and multi-day spans, repeating series, skipped dates,
   reminders. Pure functions on plain items; dates are local calendar days (YYYY-MM-DD). */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseRecur=api})(globalThis,function(){
 'use strict';
 const FREQS=['daily','weekdays','weekly','monthly','monthlyNth','yearly'];
 const EXTRA=['location','endDate','recur','exdates','remind','ics'];
 const DAY=86400000;
 const ms=d=>Date.parse(d+'T12:00:00Z');
 const iso=t=>new Date(t).toISOString().slice(0,10);
 const add=(d,n)=>iso(ms(d)+n*DAY);
 const diff=(a,b)=>Math.round((ms(b)-ms(a))/DAY);
 const wd=d=>new Date(ms(d)).getUTCDay();// 0 = Sunday
 const validDate=s=>typeof s==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(s)&&iso(ms(s))===s;
 const monthsBetween=(a,b)=>(Number(b.slice(0,4))-Number(a.slice(0,4)))*12+Number(b.slice(5,7))-Number(a.slice(5,7));
 const monthLength=d=>new Date(Date.UTC(Number(d.slice(0,4)),Number(d.slice(5,7)),0)).getUTCDate();
 /* nth weekday of the month for a date: 1–5, or -1 when it is the last one. */
 const nthOf=d=>Math.ceil(Number(d.slice(8))/7);
 const isLast=d=>Number(d.slice(8))+7>monthLength(d);
 /* Cleans the calendar fields of an event. Throws readable German messages. */
 function normalize(x){
  const out={};
  out.location=String(x.location||'').replace(/\s+/g,' ').trim().slice(0,200);
  out.endDate=x.endDate&&validDate(x.endDate)?x.endDate:'';
  if(out.endDate&&x.date&&out.endDate<x.date)throw Error('Das Ende liegt vor dem Beginn.');
  if(out.endDate===x.date)out.endDate='';
  if(out.endDate&&diff(x.date,out.endDate)>366)throw Error('Ein Termin kann höchstens ein Jahr dauern.');
  const r=x.recur;
  if(r&&FREQS.includes(r.freq)){
   const interval=Math.max(1,Math.min(99,Math.floor(Number(r.interval)||1)));
   const until=r.until&&validDate(r.until)?r.until:'';if(until&&x.date&&until<x.date)throw Error('Die Wiederholung endet vor dem ersten Termin.');
   const count=Math.max(0,Math.min(999,Math.floor(Number(r.count)||0)));
   let byday=Array.isArray(r.byday)?[...new Set(r.byday.map(Number).filter(n=>n>=0&&n<=6))].sort():[];
   if(r.freq==='weekly'&&!byday.length&&x.date)byday=[wd(x.date)];
   out.recur={freq:r.freq,interval,until,count,...(r.freq==='weekly'?{byday}:{}),...(r.freq==='monthlyNth'?{nth:r.nth===-1?-1:(x.date?nthOf(x.date):1)}:{})};
  }else out.recur=null;
  out.exdates=Array.isArray(x.exdates)?[...new Set(x.exdates.filter(validDate))].sort().slice(-500):[];
  const rem=x.remind;out.remind=rem===''||rem==null||!Number.isFinite(Number(rem))?null:Math.max(-1440,Math.min(40320,Math.round(Number(rem))));
  out.ics=typeof x.ics==='string'?x.ics.slice(0,300):'';
  return out;
 }
 /* Does a series starting at `x.date` have an occurrence that starts on `s`? (ignores exdates and count) */
 function ruleMatches(x,s){
  const r=x.recur,d0=x.date;if(!r||s<d0||(r.until&&s>r.until))return false;
  switch(r.freq){
   case 'daily':return diff(d0,s)%r.interval===0;
   case 'weekdays':{const w=wd(s);return w>=1&&w<=5}
   case 'weekly':{const mon=d=>add(d,-((wd(d)+6)%7));return (r.byday||[wd(d0)]).includes(wd(s))&&(diff(mon(d0),mon(s))/7)%r.interval===0}
   case 'monthly':return s.slice(8)===d0.slice(8)&&monthsBetween(d0,s)%r.interval===0;
   case 'monthlyNth':{if(wd(s)!==wd(d0)||monthsBetween(d0,s)%r.interval!==0)return false;return r.nth===-1?isLast(s):nthOf(s)===r.nth}
   case 'yearly':return s.slice(5)===d0.slice(5)&&(Number(s.slice(0,4))-Number(d0.slice(0,4)))%r.interval===0;
  }
  return false;
 }
 /* Index (1-based) of the occurrence starting on `s`, counting from the series start. Capped for speed. */
 function ordinal(x,s){let n=0;for(let d=x.date;d<=s&&n<=1000;d=add(d,1))if(ruleMatches(x,d))n++;return n}
 function startsOn(x,s){
  if(!x.date||!validDate(s))return false;
  if((x.exdates||[]).includes(s))return false;
  if(!x.recur)return s===x.date;
  if(!ruleMatches(x,s))return false;
  return !x.recur.count||ordinal(x,s)<=x.recur.count;
 }
 const span=x=>x.endDate&&x.endDate>x.date?diff(x.date,x.endDate):0;
 /* The occurrence of `x` that covers `date`, or null: {start, end, day (1-based day of a multi-day span)}. */
 function occurrence(x,date){
  if(!x.date||!validDate(date))return null;const len=span(x);
  for(let k=0;k<=len;k++){const s=add(date,-k);if(startsOn(x,s))return {start:s,end:add(s,len),day:k+1,days:len+1}}
  return null;
 }
 const occursOn=(x,date)=>!!occurrence(x,date);
 /* Start dates of `x` from `from` to `to` (inclusive), at most `limit`. */
 function starts(x,from,to,limit=400){const out=[];if(!x.date)return out;let d=from<x.date?x.date:from;const last=x.recur?.until&&x.recur.until<to?x.recur.until:to;if(!x.recur)return x.date>=from&&x.date<=to&&startsOn(x,x.date)?[x.date]:[];for(;d<=last&&out.length<limit;d=add(d,1))if(startsOn(x,d))out.push(d);return out}
 function next(x,from){const y=add(from,800);return starts(x,from,y,1)[0]||null}
 /* Moment a reminder is due for an occurrence starting on `start`. All-day events start at 00:00. */
 function remindAt(x,start,tzOffsetMs){if(x.remind==null)return null;const [h,m]=(x.time||'00:00').split(':').map(Number);return Date.parse(start+'T00:00:00Z')+(h*60+m)*60000-x.remind*60000-(tzOffsetMs||0)}
 const WD=['Sonntag','Montag','Dienstag','Mittwoch','Donnerstag','Freitag','Samstag'],WDS=['So','Mo','Di','Mi','Do','Fr','Sa'];
 const MON=['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
 const fmt=d=>Number(d.slice(8))+'. '+MON[Number(d.slice(5,7))-1]+' '+d.slice(0,4);
 /* German description: "Jeden Dienstag", "Alle 2 Wochen am Mo, Mi", "Monatlich am 3. Mittwoch" … */
 function describe(x){
  const r=x.recur;if(!r)return '';const n=r.interval,d0=x.date;let t='';
  if(r.freq==='daily')t=n===1?'Täglich':'Alle '+n+' Tage';
  else if(r.freq==='weekdays')t='Werktags (Mo–Fr)';
  else if(r.freq==='weekly'){const days=(r.byday||[]).slice().sort((a,b)=>((a+6)%7)-((b+6)%7));t=n===1?(days.length===1?'Jeden '+WD[days[0]]:'Wöchentlich am '+days.map(i=>WDS[i]).join(', ')):'Alle '+n+' Wochen am '+days.map(i=>WDS[i]).join(', ')}
  else if(r.freq==='monthly')t=(n===1?'Monatlich':'Alle '+n+' Monate')+' am '+Number(d0.slice(8))+'.';
  else if(r.freq==='monthlyNth')t=(n===1?'Monatlich':'Alle '+n+' Monate')+' am '+(r.nth===-1?'letzten':r.nth+'.')+' '+WD[wd(d0)];
  else if(r.freq==='yearly')t=(n===1?'Jährlich':'Alle '+n+' Jahre')+' am '+Number(d0.slice(8))+'. '+MON[Number(d0.slice(5,7))-1];
  if(r.until)t+=', bis '+fmt(r.until);else if(r.count)t+=', '+r.count+'-mal';
  return t;
 }
 return {FREQS,EXTRA,normalize,ruleMatches,startsOn,occurrence,occursOn,starts,next,remindAt,describe,add,diff,weekday:wd,nthOf,isLast,validDate};
});
