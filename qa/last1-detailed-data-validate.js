'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const window={location:{search:'?set=last&round=1'}};window.window=window;
const context=vm.createContext({window,URLSearchParams});
for(const file of ['mock-data-last.js','mock-data-last3.js','mock-data-last4.js','last-score-data.js','last-answer-data.js','last1-detailed-data.js','last-report-data.js']){
  vm.runInContext(fs.readFileSync(path.join(root,file),'utf8'),context,{filename:file});
}
const data=window.GFIELD_LAST1_DETAILED,model=window.GFIELD_MOCK_LAST,items=data.items;
assert.equal(items.length,30);assert.equal(new Set(items.map(x=>x.no)).size,30);
items.forEach((item,index)=>{
  assert.equal(item.no,index+1);assert.equal(item.reviewStatus,'verified');
  for(const key of ['title','answer','read','method','check','caution'])assert.ok(String(item[key]||'').trim(),`${item.no} ${key}`);
  assert.ok(Array.isArray(item.steps)&&item.steps.length>=3,`${item.no} 단계별 풀이`);
  item.steps.forEach(s=>assert.ok(s.title&&s.body,`${item.no} 빈 단계`));
});
assert.equal(model.blueprint.length,30);assert.deepEqual(Object.keys(model.rounds).map(k=>model.rounds[k].items.length),[30,30,30,30]);
assert.deepEqual(model.rounds['1'].items.map(x=>x.answer),items.map(x=>x.answer));
assert.equal(model.rounds['1'].items.filter(item=>item.subarea).length,30,'Last1 has 30 source-bound minor types');
assert.equal(model.rounds['1'].items.filter(item=>item.taxonomyReviewStatus==='verified-source-bound').length,30);
assert.equal(model.rounds['1'].items[20].subarea,'분배·비둘기집');
assert.equal(model.rounds['1'].items[21].subarea,'포함과 배제');
assert.equal(model.rounds['1'].items[20].prescriptionType,'경우의 수');
assert.equal(model.rounds['1'].items[21].prescriptionType,'벤다이어그램');
assert.equal(model.rounds['1'].items[7].prescriptionType,'','unsafe opposite-number to dice link stays blocked');
assert.equal(model.rounds['1'].items[23].prescriptionOverride.label,'연속한 11 조건이 있는 수');
assert.equal(model.rounds['1'].items[24].prescriptionOverride.label,'이진법');
assert.equal(model.rounds['1'].items[25].prescriptionOverride.books['지필드'][0].u,'CH1 NUMBERS · 재치 있게 계산하기');
assert.equal(items[6].answer,'ㄱ이 28개 더 많다');
assert.match(items[11].steps.map(x=>x.body).join(' '),/1,3,6,2,7,5,4,4,5,7,2,6,3,1,8/);
assert.equal(items[12].answer,'3, 6, 7, 8, 11, 12, 13, 17, 18, 22, 23, 24');
assert.match(items[19].steps.map(x=>x.body).join(' '),/3,5,1,2,6,3,1,2,6,5,4,6,3,2/);
assert.equal(items[23].answer,'2862');assert.match(items[23].check,/243개/);assert.match(items[23].caution,/2826/);
assert.equal(items[25].answer,'3370');assert.equal(items[28].answer,'140가지');
assert.equal(items[29].answer,'ㄱ=3, ㄴ=2, ㄷ=0, ㄹ=1');
console.log('PASS Last1 30 detailed solutions, report adapter, source-specific recalculation locks');
