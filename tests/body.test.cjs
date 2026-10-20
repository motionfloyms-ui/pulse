const test=require('node:test'),assert=require('node:assert/strict');const {js}=require('./helpers.cjs');
const D=js('domain/body/drinks.js'),Ctx=js('domain/context/engine.js'),P=js('domain/body/progress.js');
test('drinks need an explicit amount',()=>{assert.equal(D.parse('ein Glas Wasser').ok,false);const w=D.parse('0,5 l Wasser getrunken');assert.equal(w.ml,500);assert.equal(w.waterMl,500)});
test('coffee counts as drink but not as water',()=>{const c=D.parse('200 ml Kaffee');assert.equal(c.ml,200);assert.equal(c.waterMl,0)});
test('thursday moves the warm meal earlier',()=>{assert.equal(Ctx.mealSlots('2026-10-22')[1].time,'16:45');assert.equal(Ctx.mealSlots('2026-10-21')[1].time,'18:30')});
test('training alternates A and B by actual history',()=>{const db={days:{},workouts:[{date:'2026-10-19',plan:'A'}],events:[],planOverrides:{}};assert.equal(Ctx.training(db,'2026-10-21').plan,'B')});
test('readiness needs a complete check-in',()=>{assert.equal(Ctx.score({sleep:8}),null);assert.ok(Ctx.score({sleep:8,sleepQ:8,stress:2,sore:2,energy:8,mood:8})>80)});
test('weekly averages ignore days without records',()=>{const db={days:{'2026-10-20':{kcal:1600,protein:120,meals:3}}};const w=P.week(db,'2026-10-20',Ctx.offset,Ctx.score);assert.equal(w.averages.kcal.count,1);assert.equal(w.averages.kcal.value,1600)});
