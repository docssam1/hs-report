'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const context={window:{}};vm.createContext(context);vm.runInContext(fs.readFileSync(path.join(root,'bank/important-types.js'),'utf8'),context);
const config=context.window.GFIELD_IMPORTANT_TYPES;
const expected={
  'digit-product':['1-4'],'assumption':['1-8','2-1'],'broken-clock':['1-6'],'number-pyramid':['1-10'],'rectangle-count':['1-22'],'units-digit-power':['1-24'],'digit-card-sum':['1-29'],'number-code':['1-30'],
  'top-view':['2-12'],'shortest-path':['2-13'],'grouped-sequence':['2-15'],'league-tournament':['2-19'],'coin-combinations':['2-22'],'shape-pattern':['2-25'],'consecutive-sum':['2-30']
};
assert.equal(config.maxQuestions,40);
assert.deepEqual(Array.from(config.questionCounts),[4,8,20,40]);
assert.equal(config.types.length,15,'teacher selected 15 student buttons');
assert.deepEqual(Object.fromEntries(config.types.map(type=>[type.id,Array.from(type.sources,source=>source.round+'-'+source.no)])),expected,'exact teacher-selected source mapping');
const sources=config.types.flatMap(type=>Array.from(type.sources,source=>({typeId:type.id,...source})));
assert.equal(sources.length,16,'15 buttons represent 16 originals because the two assumption types are merged');
assert.equal(new Set(sources.map(source=>source.round+'-'+source.no)).size,16,'no source appears under two buttons');
const rounds={1:JSON.parse(fs.readFileSync(path.join(root,'bank/data/final1-fixed90.json'),'utf8')),2:JSON.parse(fs.readFileSync(path.join(root,'bank/data/final2-fixed90.json'),'utf8'))};
sources.forEach(source=>{
  const items=rounds[source.round].items.filter(item=>item.sourceNo===source.no);
  assert.equal(items.length,3,source.round+'회 '+source.no+'번 fixed variants');
  assert.ok(items.every(item=>item.reviewStatus==='verified'),source.round+'회 '+source.no+'번 verified');
});
assert.equal(sources.length*3,48,'selected fixed pool has 48 questions before the 40-question cap');
const q4=rounds[1].items.filter(item=>item.sourceNo===4);
assert.deepEqual(new Set(q4.map(item=>item.meta.factorFormat)),new Set(['2×2','3×2','3×3']),'Q4 covers all three teacher-selected factor formats');
const home=fs.readFileSync(path.join(root,'index.html'),'utf8'),fixed=fs.readFileSync(path.join(root,'bank/bank-fixed.js'),'utf8'),runtime=fs.readFileSync(path.join(root,'bank/important-generators.js'),'utf8');
assert.match(home,/GFIELD_IMPORTANT_TYPES/);assert.match(home,/data-important-type/);assert.match(home,/bank=index\.html\?bank=important|bank\/index\.html\?bank=important/);
assert.match(fixed,/config\.code==='important'/);assert.match(fixed,/Math\.min\(requestedCount,setting\.maxQuestions\)/);
for(const typeId of Object.keys(expected))assert.match(runtime,new RegExp("['\"]"+typeId+"['\"]"),typeId+' has a runtime generator route');
assert.match(fixed,/BANK_IMPORTANT_GENERATORS/,'important bank supplements the three anchors with verified runtime variants');
console.log('PASS important bank: 15 teacher buttons, 16 exact originals, 48 verified anchors, every type can fill 40 questions, merged assumption type, Q4 2x2/3x2/3x3');
