// Count words: one helper so "1 Stern" never reads "1 Sterne".
const test=require('node:test');const assert=require('node:assert/strict');const fs=require('node:fs');const path=require('node:path');const vm=require('node:vm');
const src=fs.readFileSync(path.join(__dirname,'../src/js/ui/core-flows.js'),'utf8');
const pick=name=>{const m=src.match(new RegExp('function '+name+'\\([^\\n]*'));assert.ok(m,name+' exists');return m[0]};
const ctx={};vm.runInNewContext(pick('anz')+';'+pick('vorTagen')+';this.anz=anz;this.vorTagen=vorTagen',ctx);
test('counts use singular for exactly one',()=>{
 assert.equal(ctx.anz(1,'Stern','Sterne'),'1 Stern');assert.equal(ctx.anz(0,'Stern','Sterne'),'0 Sterne');assert.equal(ctx.anz(2,'Stern','Sterne'),'2 Sterne');assert.equal(ctx.anz('1','Tag','Tagen'),'1 Tag');
});
test('backup age reads naturally',()=>{
 assert.equal(ctx.vorTagen(0),'heute');assert.equal(ctx.vorTagen(1),'gestern');assert.equal(ctx.vorTagen(9),'vor 9 Tagen');
});
