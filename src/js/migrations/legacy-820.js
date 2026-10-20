// SOURCE: migrations/legacy-820.js
/* Compatibility migrations: original order and markers, no I/O or rendering. */
(function(root,factory){if(typeof module==='object'&&module.exports)module.exports=factory(require('../state/schema.js'),require('../domain/memory/records.js'));else root.PulseMigrations=factory(root.PulseState,root.PulseMemory)})(globalThis,function(state,memory){
function run(input,key){const db=state.normalize(input);
const {upsertFact,currentFact,supersedeFact,addDecision,addEvent,flagIssue}=memory.create(()=>db,key);
db.foodLibrary=db.foodLibrary||[]; db.mealTemplates=db.mealTemplates||[]; db.inbox=db.inbox||[]; db.settings=db.settings||{dayMode:'auto'}; db.deferred=db.deferred||[]; db.people=db.people||[]; db.memory=db.memory||[];
db.supplements=db.supplements||[];db.cycles=db.cycles||[];db.planOverrides=db.planOverrides||{};db.activeWorkout=db.activeWorkout||null;
// PULSE 5.0 — historical memory migration from the verified Claude handover.
// Merge-only: existing/newer user data wins; this migration never wipes localStorage.
db.imports=db.imports||[]; db.historicalEvents=db.historicalEvents||[];
function seedDay(date,patch){db.days[date]=Object.assign({water:0,steps:0,kcal:0,protein:0,carbs:0,fat:0,fiber:0,meals:0,recovery:null,waist:null,energyDrinks:0,cycleContext:null},patch,db.days[date]||{})}
function seedBody(x){if(!db.body.some(z=>z.date===x.date))db.body.push(x)}
function seedMeal(x){if(!db.meals.some(z=>z.date===x.date&&z.name===x.name))db.meals.push(x)}
function seedSet(x){if(!db.workouts.some(z=>z.date===x.date&&z.plan===x.plan&&z.exercise===x.exercise&&z.set===x.set)){x.volume=+(x.kg*x.reps).toFixed(1);x.pr=false;db.workouts.push(x)}}
function seedMemory(type,text,validFrom=null,validTo=null,status='current'){if(!db.memory.some(x=>x.type===type&&x.text===text))db.memory.push({type,text,validFrom,validTo,status,source:'Claude Übergabe 01.10.2026'})}
// Personal history is not part of the code. It arrives through the user's own backup.
db.schemaVersion=Math.max(Number(db.schemaVersion||0),52);
db.facts=Array.isArray(db.facts)?db.facts:[];
db.decisions=Array.isArray(db.decisions)?db.decisions:[];
db.events=Array.isArray(db.events)?db.events:[];
db.dataIssues=Array.isArray(db.dataIssues)?db.dataIssues:[];

function migrateSemanticMemory(){if(!db.imports.includes('semantic-memory-v52'))db.imports.push('semantic-memory-v52')}
function auditData(){
 const groups={};db.facts.filter(x=>x.status==='current').forEach(x=>{const k=x.domain+'|'+x.key;(groups[k]??=[]).push(x)});
 Object.entries(groups).forEach(([ref,arr])=>{const vals=[...new Set(arr.map(x=>JSON.stringify(x.value)))];if(vals.length>1)flagIssue({type:'conflicting-current-facts',ref,message:'Mehrere aktuelle Werte: '+vals.join(' / ')})});
 db.workouts.forEach((w,i)=>{if(Number(w.reps)<0||Number(w.kg)<0)flagIssue({type:'invalid-workout',ref:String(i),message:'Negativer Trainingswert'})});
 
}
migrateSemanticMemory();auditData();

db.schemaVersion=820;
db.timeline=Array.isArray(db.timeline)?db.timeline:[];
db.captureHistory=Array.isArray(db.captureHistory)?db.captureHistory:[];
db.personalFoodAliases=db.personalFoodAliases&&typeof db.personalFoodAliases==='object'?db.personalFoodAliases:{};
db.uiPrefs=db.uiPrefs&&typeof db.uiPrefs==='object'?db.uiPrefs:{};

db.undoStack=Array.isArray(db.undoStack)?db.undoStack:[];
db.actionHistory=Array.isArray(db.actionHistory)?db.actionHistory:[];
db.dismissedActions=db.dismissedActions&&typeof db.dismissedActions==='object'?db.dismissedActions:{};


return db;
}
return {run};
});


