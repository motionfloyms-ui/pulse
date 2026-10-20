// SOURCE: domain/life/ics.js
/* iCalendar (.ics) import and export, e.g. for moving from Google Calendar. Handles time zones,
   all-day and multi-day events, RRULE (daily/weekly/monthly/yearly with INTERVAL, BYDAY, UNTIL,
   COUNT), EXDATE, moved single instances (RECURRENCE-ID) and the first VALARM. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('./recur.js'):root.PulseRecur);if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseICS=api})(globalThis,function(Recur){
 'use strict';
 const unfold=t=>String(t||'').replace(/\r\n/g,'\n').replace(/\n[ \t]/g,'').split('\n');
 const unescape=v=>v.replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1');
 const escape=v=>String(v||'').replace(/\\/g,'\\\\').replace(/\n/g,'\\n').replace(/([,;])/g,'\\$1');
 function prop(line){const i=line.indexOf(':');if(i<0)return null;const head=line.slice(0,i),value=line.slice(i+1),[name,...ps]=head.split(';'),params={};for(const p of ps){const [k,v]=p.split('=');params[k.toUpperCase()]=(v||'').replace(/^"|"$/g,'')}return {name:name.toUpperCase(),params,value}}
 /* Offset (ms) of a time zone at an instant. */
 function tzOffset(tz,utcMs){
  try{const f=new Intl.DateTimeFormat('en-US',{timeZone:tz,hourCycle:'h23',year:'numeric',month:'2-digit',day:'2-digit',hour:'2-digit',minute:'2-digit',second:'2-digit'});
   const p=Object.fromEntries(f.formatToParts(new Date(utcMs)).map(x=>[x.type,x.value]));
   return Date.UTC(+p.year,+p.month-1,+p.day,+p.hour%24,+p.minute,+p.second)-utcMs}catch(_){return null}
 }
 function wallToUtc(y,mo,d,h,mi,s,tz){const guess=Date.UTC(y,mo-1,d,h,mi,s);const o1=tzOffset(tz,guess);if(o1==null)return null;const o2=tzOffset(tz,guess-o1);return guess-(o2==null?o1:o2)}
 function utcToWall(ms,tz){const o=tzOffset(tz,ms)||0;const d=new Date(ms+o);return {date:d.toISOString().slice(0,10),time:d.toISOString().slice(11,16)}}
 /* An ICS date/time in the target zone: {date, time ('' for all-day)}. */
 function when(p,target){
  if(!p)return null;const v=p.value.trim(),m=v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?$/);if(!m)return null;
  const [,y,mo,d,h,mi,s,z]=m;const date=y+'-'+mo+'-'+d;
  if(!h||p.params.VALUE==='DATE')return {date,time:'',allDay:true};
  if(z)return {...utcToWall(Date.UTC(+y,+mo-1,+d,+h,+mi,+(s||0)),target),allDay:false};
  if(p.params.TZID){const tz=p.params.TZID.replace(/^\/[^/]*\//,'');const u=wallToUtc(+y,+mo,+d,+h,+mi,+(s||0),tz);if(u!=null)return {...utcToWall(u,target),allDay:false}}
  return {date,time:h+':'+mi,allDay:false};// floating time
 }
 const DAYS={SU:0,MO:1,TU:2,WE:3,TH:4,FR:5,SA:6};
 function rrule(v,start,target){
  const r=Object.fromEntries(v.split(';').map(x=>x.split('=')).map(([k,val])=>[k.toUpperCase(),val||'']));let simplified=false;
  const interval=Number(r.INTERVAL)||1,count=Number(r.COUNT)||0;
  let until='';if(r.UNTIL){const u=when({value:r.UNTIL,params:{}},target);until=u?u.date:''}
  const byday=(r.BYDAY||'').split(',').filter(Boolean);
  if(r.BYSETPOS||r.BYHOUR||r.BYMINUTE||r.BYWEEKNO||r.BYYEARDAY)simplified=true;
  let out=null;
  if(r.FREQ==='DAILY')out={freq:'daily',interval};
  else if(r.FREQ==='WEEKLY'){const days=byday.map(b=>DAYS[b.slice(-2)]).filter(n=>n!=null);const wk=[1,2,3,4,5];out=interval===1&&days.length===5&&wk.every(d=>days.includes(d))?{freq:'weekdays',interval:1}:{freq:'weekly',interval,byday:days.length?days:[Recur.weekday(start)]}}
  else if(r.FREQ==='MONTHLY'){const nth=byday.length===1&&byday[0].match(/^([+-]?\d)?(MO|TU|WE|TH|FR|SA|SU)$/);if(nth&&nth[1]){out={freq:'monthlyNth',interval,nth:Number(nth[1])<0?-1:Number(nth[1])}}else{out={freq:'monthly',interval};if(byday.length||(r.BYMONTHDAY&&Number(r.BYMONTHDAY)!==Number(start.slice(8))))simplified=true}}
  else if(r.FREQ==='YEARLY'){out={freq:'yearly',interval};if(r.BYDAY||(r.BYMONTH&&r.BYMONTH.includes(',')))simplified=true}
  else simplified=true;
  return out?{recur:{...out,until,count},simplified}:{recur:null,simplified:true};
 }
 function trigger(v){const m=String(v||'').match(/^(-)?P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?)?$/);if(!m)return null;const min=(+(m[2]||0))*10080+(+(m[3]||0))*1440+(+(m[4]||0))*60+(+(m[5]||0));return m[1]?min:-min}
 function duration(v){const m=String(v||'').match(/^P(?:(\d+)W)?(?:(\d+)D)?(?:T(?:(\d+)H)?(?:(\d+)M)?)?/);return m?(+(m[1]||0))*10080+(+(m[2]||0))*1440+(+(m[3]||0))*60+(+(m[4]||0)):0}
 /* Parses an .ics text into event field objects for PulseLife.create (kind 'event'). */
 function parse(text,{target='Europe/Berlin'}={}){
  const lines=unfold(text),raw=[];let cur=null,alarm=false,depth=0;
  for(const line of lines){
   if(/^BEGIN:VEVENT/i.test(line)){cur={exdates:[]};depth=1;continue}
   if(!cur)continue;
   if(/^BEGIN:VALARM/i.test(line)){alarm=true;continue}if(/^END:VALARM/i.test(line)){alarm=false;continue}
   if(/^BEGIN:/i.test(line)){depth++;continue}if(/^END:VEVENT/i.test(line)){raw.push(cur);cur=null;continue}if(/^END:/i.test(line)){depth--;continue}
   const p=prop(line);if(!p)continue;
   if(alarm){if(p.name==='TRIGGER'&&cur.remind==null&&p.params.RELATED!=='END'){const t=trigger(p.value);if(t!=null)cur.remind=t}continue}
   if(p.name==='EXDATE')for(const v of p.value.split(','))cur.exdates.push({value:v,params:p.params});
   else cur[p.name]=p;
  }
  const events=[],overrides=[];let simplified=0,skipped=0;
  for(const r of raw){
   const s=when(r.DTSTART,target);if(!s){skipped++;continue}
   if(r.STATUS&&/CANCELLED/i.test(r.STATUS.value)){skipped++;continue}
   const e=when(r.DTEND,target);
   const x={kind:'event',title:unescape(r.SUMMARY?.value||'').trim()||'Termin',body:unescape(r.DESCRIPTION?.value||'').trim().slice(0,5000),location:unescape(r.LOCATION?.value||'').trim(),date:s.date,time:s.time,ics:(r.UID?.value||'').trim(),remind:r.remind??null,exdates:[]};
   if(s.allDay){if(e&&e.date>s.date){const last=Recur.add(e.date,-1);if(last>s.date)x.endDate=last}}
   else{let min=e?Math.round((Date.parse(e.date+'T'+e.time+':00Z')-Date.parse(s.date+'T'+s.time+':00Z'))/60000):duration(r.DURATION?.value);if(!(min>0))min=60;if(min>1440){x.endDate=e.date;x.duration=60}else x.duration=min}
   if(r.RRULE){const rr=rrule(r.RRULE.value,s.date,target);if(rr.recur)x.recur=rr.recur;if(rr.simplified)simplified++}
   for(const ex of r.exdates){const w=when(ex,target);if(w)x.exdates.push(w.date)}
   if(r['RECURRENCE-ID']){const o=when(r['RECURRENCE-ID'],target);overrides.push({uid:x.ics,original:o?o.date:'',event:{...x,ics:x.ics+'#'+(o?o.date:x.date),recur:undefined}});continue}
   events.push(x);
  }
  for(const o of overrides){const series=events.find(e=>e.ics===o.uid&&e.recur);if(series&&o.original)series.exdates.push(o.original);events.push(o.event)}
  return {events,simplified,skipped};
 }
 const stamp=d=>d.replace(/-/g,'');
 const RR={daily:'DAILY',weekdays:'WEEKLY',weekly:'WEEKLY',monthly:'MONTHLY',monthlyNth:'MONTHLY',yearly:'YEARLY'};
 const BY=['SU','MO','TU','WE','TH','FR','SA'];
 /* RFC 5545: with a TZID start, UNTIL must be UTC – the end of that local day. */
 function untilUtc(d,tz){const [y,m,dd]=d.split('-').map(Number),guess=Date.UTC(y,m-1,dd,23,59,59),o=tzOffset(tz,guess)||0;return new Date(guess-o).toISOString().replace(/[-:]/g,'').slice(0,15)+'Z'}
 const fold=l=>{let out='';while(l.length>74){out+=l.slice(0,74)+'\r\n ';l=l.slice(74)}return out+l};
 /* Events → .ics text. Timed events carry TZID of `tz`. */
 function build(items,{tz='Europe/Berlin',now=new Date().toISOString()}={}){
  const L=['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//PULSE//DE','CALSCALE:GREGORIAN'];
  const dt=(d,t)=>stamp(d)+'T'+t.replace(':','')+'00';
  for(const x of items){
   if(x.kind!=='event'||!x.date)continue;
   L.push('BEGIN:VEVENT','UID:'+(x.ics||String(x.id)+'@pulse'),'DTSTAMP:'+now.replace(/[-:]/g,'').slice(0,15)+'Z','SUMMARY:'+escape(x.title));
   if(x.time){const end=new Date(Date.parse(x.date+'T'+x.time+':00Z')+(x.duration||60)*60000).toISOString();L.push('DTSTART;TZID='+tz+':'+dt(x.date,x.time),'DTEND;TZID='+tz+':'+dt(end.slice(0,10),end.slice(11,16)))}
   else{L.push('DTSTART;VALUE=DATE:'+stamp(x.date),'DTEND;VALUE=DATE:'+stamp(Recur.add(x.endDate||x.date,1)))}
   if(x.location)L.push('LOCATION:'+escape(x.location));if(x.body)L.push('DESCRIPTION:'+escape(x.body));
   const r=x.recur;if(r){let s='FREQ='+RR[r.freq];if(r.interval>1)s+=';INTERVAL='+r.interval;if(r.freq==='weekdays')s+=';BYDAY=MO,TU,WE,TH,FR';if(r.freq==='weekly')s+=';BYDAY='+(r.byday||[]).map(i=>BY[i]).join(',');if(r.freq==='monthlyNth')s+=';BYDAY='+r.nth+BY[Recur.weekday(x.date)];if(r.until)s+=';UNTIL='+(x.time?untilUtc(r.until,tz):stamp(r.until));else if(r.count)s+=';COUNT='+r.count;L.push('RRULE:'+s)}
   if(x.exdates?.length)L.push(x.time?'EXDATE;TZID='+tz+':'+x.exdates.map(d=>dt(d,x.time)).join(','):'EXDATE;VALUE=DATE:'+x.exdates.map(stamp).join(','));
   if(x.remind!=null)L.push('BEGIN:VALARM','ACTION:DISPLAY','DESCRIPTION:'+escape(x.title),'TRIGGER:'+(x.remind>=0?'-PT'+x.remind+'M':'PT'+(-x.remind)+'M'),'END:VALARM');
   L.push('END:VEVENT');
  }
  L.push('END:VCALENDAR');return L.map(fold).join('\r\n')+'\r\n';
 }
 return {parse,build,tzOffset,when,rrule,trigger};
});
