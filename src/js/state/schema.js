// SOURCE: state/schema.js
/* JSON boundary for schema 820. Unknown fields are deliberately preserved. */
(function(root,factory){const api=factory(typeof module==='object'&&module.exports?require('../domain/life/model.js'):root.PulseLife);if(typeof module==='object'&&module.exports)module.exports=api;else root.PulseState=api})(globalThis,function(Life){
 'use strict';
 const SCHEMA_VERSION=820;
 const arrays=['workouts','body','meals','supplements','cycles','foodLibrary','mealTemplates','inbox','deferred','people','memory','historicalEvents','facts','decisions','events','dataIssues','timeline','captureHistory','undoStack','actionHistory','tasks','drinks'];
 const objects=['settings','planOverrides','personalFoodAliases','uiPrefs','dismissedActions'];
 const dayDefaults={water:0,steps:0,kcal:0,protein:0,carbs:0,fat:0,fiber:0,meals:0,recovery:null,waist:null,energyDrinks:0,cycleContext:null};
 function problem(message,code='INVALID_DATA'){const e=new Error(message);e.code=code;throw e}
 function isObject(v){return v!==null&&typeof v==='object'&&!Array.isArray(v)}
 function schemaVersion(value){if(value==null)return;if(typeof value!=='number'||!Number.isInteger(value)||value<0)problem('Ungültige Datenversion.');if(value>SCHEMA_VERSION)problem('Diese Daten stammen aus einer neueren PULSE-Version.','FUTURE_SCHEMA')}
 function create(){return {days:{},workouts:[],body:[],meals:[],waterGoal:2,weight:null,supplements:[],cycles:[],foodLibrary:[],mealTemplates:[],inbox:[],settings:{dayMode:'auto'},deferred:[]}}
 function clone(value){return JSON.parse(JSON.stringify(value))}
 function numberFields(record,fields,label){for(const field of fields){const value=record[field];if(value!=null&&(typeof value!=='number'||!Number.isFinite(value)))problem(label+': ungültiger Zahlenwert '+field)}}
 function normalize(input){
  if(!isObject(input))problem('Das Backup enthält kein PULSE-Datenobjekt.');
  schemaVersion(input.schemaVersion);
  if(!isObject(input.days)||!Array.isArray(input.workouts))problem('Tagesdaten oder Trainingsliste fehlen.');
  // Validate before JSON cloning: JSON would silently change NaN/Infinity to null.
  numberFields(input,['waterGoal','weight'],'Einstellungen');
  for(const name of arrays){if(input[name]!=null&&!Array.isArray(input[name]))problem('Ungültige Liste: '+name);if(Array.isArray(input[name])&&input[name].some(v=>!isObject(v)))problem('Ungültiger Eintrag: '+name)}
  for(const name of objects)if(input[name]!=null&&!isObject(input[name]))problem('Ungültiges Objekt: '+name);
  if(input.imports!=null&&(!Array.isArray(input.imports)||input.imports.some(x=>typeof x!=='string')))problem('Ungültige Migrationsmarker.');
  for(const [date,day] of Object.entries(input.days)){
   if(!/^\d{4}-\d{2}-\d{2}$/.test(date)||!isObject(day))problem('Ungültiger Tagesdatensatz: '+date);
   for(const field of ['water','steps','kcal','protein','carbs','fat','fiber','meals','energyDrinks'])if(day[field]===null)problem('Leerer Zahlenwert in Tagesdaten: '+field);
   numberFields(day,['water','steps','kcal','protein','carbs','fat','fiber','meals','waist','energyDrinks'],'Tagesdaten');
   for(const field of ['recovery','cycleContext'])if(day[field]!=null&&!isObject(day[field]))problem('Ungültiger Tageskontext.');
   if(day.recovery)numberFields(day.recovery,['sleep','sleepQ','stress','sore','energy','mood'],'Recovery');
  }
  for(const name of ['workouts','body','meals'])for(const item of input[name]||[])numberFields(item,['kg','reps','rpe','volume','weight','waist','hip','thigh','chest','kcal','protein','carbs','fat','fiber'],name);
  for(const item of input.drinks||[]){numberFields(item,['ml','waterMl'],'Getränk');if(!(item.ml>0)||item.waterMl<0)problem('Ungültige Getränkemenge.');if(item.nutrition!=null){if(!isObject(item.nutrition))problem('Ungültige Getränkenährwerte.');numberFields(item.nutrition,['kcal','protein','carbs','fat','fiber'],'Getränk')}}
  for(const name of arrays)for(const item of input[name]||[])for(const field of ['date','due'])if(item[field]!=null&&typeof item[field]!=='string')problem('Ungültiges Datum in '+name);
  if(input.life!=null)Life.validate(input.life);
  const state=clone(input);
  for(const name of arrays)if(state[name]==null)state[name]=[];
  for(const name of objects)if(state[name]==null)state[name]={};
  if(state.imports==null)state.imports=[];
  if(state.settings.dayMode==null)state.settings.dayMode='auto';
  if(state.waterGoal==null)state.waterGoal=2;
  if(state.weight===undefined)state.weight=null;
  if(state.activeWorkout==null)state.activeWorkout=null;
  else if(!isObject(state.activeWorkout)||!['A','B'].includes(state.activeWorkout.plan)||typeof state.activeWorkout.date!=='string')problem('Ungültige aktive Trainingseinheit.');
  for(const date of Object.keys(state.days))state.days[date]={...dayDefaults,...state.days[date]};
  return state;
 }
 function parseBackup(text){
  let data;try{data=JSON.parse(text)}catch(_){problem('Die Datei enthält kein gültiges JSON.','INVALID_JSON')}
  if(isObject(data)&&Object.prototype.hasOwnProperty.call(data,'data')){
   if(data.app!=null&&data.app!=='PULSE')problem('Dieses Backup gehört nicht zu PULSE.');
   schemaVersion(data.schemaVersion);data=data.data;
  }
  return normalize(data);
 }
 return {SCHEMA_VERSION,create,normalize,parseBackup,clone};
});


