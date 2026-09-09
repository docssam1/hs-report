'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const sandbox={console};sandbox.window=sandbox;sandbox.globalThis=sandbox;vm.createContext(sandbox);
vm.runInContext(fs.readFileSync(path.join(root,'mock-data-final.js'),'utf8'),sandbox,{filename:'mock-data-final.js'});
vm.runInContext(fs.readFileSync(path.join(root,'final4-detailed-data.js'),'utf8'),sandbox,{filename:'final4-detailed-data.js'});
const data=sandbox.GFIELD_FINAL4_DETAILED;
const resolve=sandbox.GFIELD_FINAL4_RESOLVE_SOLUTION;
const review=JSON.parse(fs.readFileSync(path.join(root,'qa','final4-detailed-review.json'),'utf8'));
assert.ok(data&&data.contract,'Final4 detailed data exists');
assert.equal(data.contract.round,4);
assert.equal(data.items.length,9);
assert.equal(review.reviewId,data.contract.reviewId);
assert.deepEqual(review.summary,{verified:9,locked:1,pendingAfter10:20});
assert.deepEqual(Array.from(data.items,function(item){return item.no;}),[1,2,3,4,5,6,7,8,10]);
const round=sandbox.GFIELD_MOCK_FINAL.rounds['4'];
for(const item of data.items){
  const source=round.items.find(row=>row.no===item.no);
  assert.ok(source,'source item '+item.no);
  assert.equal(item.answer,source.answer,'canonical answer '+item.no);
  assert.equal(item.steps.length>=3,true,'three-step minimum '+item.no);
  assert.ok(item.read&&item.method&&item.check&&item.caution&&item.comment,'complete pedagogy '+item.no);
  assert.equal(resolve(source).no,item.no,'resolver '+item.no);
}
for(const no of [9,11,12,16,17,21,24,26,27]){
  const source=round.items.find(row=>row.no===no);
  assert.equal(resolve(source),null,'held item '+no+' stays pending');
}
assert.match(data.items.find(item=>item.no===3).caution,/12시간의 정확한 횟수 22번/);
assert.match(data.items.find(item=>item.no===4).caution,/조건이 없습니다/);
assert.doesNotMatch(data.items.find(item=>item.no===4).caution,/3학년|범위를 벗어/);
assert.match(data.items.find(item=>item.no===10).steps[1].body,/111111111110888888888889/);
console.log('PASS Final4 safe first ten: 9 detailed, Q9 and unresolved source items held');
