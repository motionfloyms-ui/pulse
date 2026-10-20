// SOURCE: domain/memory/records.js
/* Semantic records: explicit validity windows and user-correction precedence. */
(function(root,factory){const api=factory();if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseMemory=api})(globalThis,function(){
function create(getState,key){
function upsertFact(f){const db=getState();
 const id=f.id||[f.domain,f.key,f.validFrom||'',String(f.value)].join('|');
 const x={id,domain:'general',key:'',value:null,unit:null,status:'current',validFrom:null,validTo:null,source:'user',confidence:'confirmed',recordedAt:key(),...f};
 const i=db.facts.findIndex(v=>v.id===id); if(i<0)db.facts.push(x);else db.facts[i]={...db.facts[i],...x}; return x;
}
function currentFact(domain,k,date=key()){const db=getState();return db.facts.filter(x=>x.domain===domain&&x.key===k&&x.status==='current'&&(!x.validFrom||x.validFrom<=date)&&(!x.validTo||x.validTo>=date)).sort((a,b)=>(Number(b.source==='user-correction')-Number(a.source==='user-correction'))||String(b.validFrom||'').localeCompare(String(a.validFrom||''))||String(b.recordedAt||'').localeCompare(String(a.recordedAt||'')))[0]||null}
function supersedeFact(domain,k,newFact){const db=getState();db.facts.forEach(x=>{if(x.domain===domain&&x.key===k&&x.status==='current'){x.status='superseded';x.validTo=newFact.validFrom||key()}});return upsertFact({...newFact,domain,key:k,status:'current'})}
function addDecision(d){const db=getState();const id=d.id||[d.date,d.domain,d.title].join('|');if(!db.decisions.some(x=>x.id===id))db.decisions.push({id,status:'active',source:'user',...d})}
function addEvent(e){const db=getState();const id=e.id||[e.date,e.type,e.title].join('|');if(!db.events.some(x=>x.id===id))db.events.push({id,source:'user',confidence:'confirmed',...e})}
function flagIssue(issue){const db=getState();const id=issue.id||[issue.type,issue.ref||'',issue.message].join('|');if(!db.dataIssues.some(x=>x.id===id))db.dataIssues.push({id,status:'open',created:key(),...issue})}

return {upsertFact,currentFact,supersedeFact,addDecision,addEvent,flagIssue};
}
return {create};
});


