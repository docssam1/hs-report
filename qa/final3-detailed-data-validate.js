'use strict';

const assert=require('assert/strict');
const fs=require('fs');
const path=require('path');
const vm=require('vm');

const root=path.resolve(__dirname,'..');
const read=name=>fs.readFileSync(path.join(root,name),'utf8');

function load(options={}){
  const box={window:{}};
  vm.createContext(box);
  vm.runInContext(read('mock-data-final.js'),box,{filename:'mock-data-final.js'});
  if(!options.withoutDiagrams) vm.runInContext(options.diagramSource||read('final3-solution-diagrams.js'),box,{filename:'final3-solution-diagrams.js'});
  vm.runInContext(options.dataSource||read('final3-detailed-data.js'),box,{filename:'final3-detailed-data.js'});
  return box.window;
}

const expectedAnswers=new Map([
  [1,['144,233','바나나 144개, 사과 233개']],[2,['성은','성은']],[3,['188','검은 타일 188개']],
  [4,['오른손 중지','오른손 중지']],[5,['목요일','목요일']],[6,['21','21개']],[7,['원, 1','동그라미 1개']],
  [8,['5544','5544가지']],[9,['15,9,36,4','15, 9, 36, 4']],[10,['124','124개']],[11,['118','118']],
  [12,['9','9개']],[13,['377','377가지']],[14,['35,21','관호 35살, 주연 21살']],[15,['13','13']]
]);
const diagramNos=new Set([1,3,4,6,7,8,13]);
const live=load();
const data=live.GFIELD_FINAL3_DETAILED;
const canonical=live.GFIELD_MOCK_FINAL.rounds[3].items;
const resolve=live.GFIELD_FINAL3_RESOLVE_SOLUTION;

assert.equal(data.contract.round,3);
assert.equal(data.contract.expectedCount,15);
assert.equal(data.contract.totalQuestions,30);
assert.equal(data.contract.evidenceStatus,'verified');
assert.equal(data.contract.independentReviewStatus,'verified');
assert.equal(data.contract.releaseStatus,'eligible');
assert.deepEqual(Array.from(data.contract.expectedNos),Array.from({length:15},(_,i)=>i+1));
assert.deepEqual(Array.from(data.contract.learnerFitCriteria),['language','representations','prerequisites','reasoning-load','response-mode']);
assert.equal(data.items.length,15);
assert.equal(new Set(data.items.map(item=>item.no)).size,15);

for(const item of data.items){
  const pair=expectedAnswers.get(item.no);
  assert.ok(pair,'unexpected item '+item.no);
  assert.equal(item.answer,pair[0],'canonical answer '+item.no);
  assert.equal(item.displayAnswer,pair[1],'display answer '+item.no);
  assert.equal(item.sourceLocator,'materials/final_3/'+(item.no<=4?'001':item.no<=9?'002':'003')+'.jpg#q'+item.no);
  assert.equal(item.reviewStatus,'verified');
  assert.equal(item.releaseStatus,'eligible');
  assert.ok(item.steps.length>=3);
  assert.equal(Boolean(item.diagram),diagramNos.has(item.no));
  const roundItem=canonical.find(row=>row.no===item.no);
  assert.equal(String(roundItem.answer),item.answer,'canonical source binding '+item.no);
  assert.equal(resolve(roundItem).no,item.no,'reviewed item is public '+item.no);
  assert.equal(resolve(roundItem,{allowLocked:true}).no,item.no,'preview uses the same reviewed item '+item.no);
}

assert.equal(resolve({...canonical[0],answer:'144, 233'},{allowLocked:true}),null,'no fuzzy canonical normalization');
assert.equal(resolve({...canonical[6],answer:'원,1'},{allowLocked:true}),null,'canonical spacing is exact');
assert.equal(resolve({...canonical[0],no:16},{allowLocked:true}),null,'unreviewed question remains unavailable');

const noDiagrams=load({withoutDiagrams:true});
for(const no of diagramNos) assert.equal(noDiagrams.GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===no),{allowLocked:true}),null,'missing diagram locks '+no);
assert.ok(noDiagrams.GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===2),{allowLocked:true}),'text-only item does not need diagram renderer');

const displayMutation=read('final3-detailed-data.js').replace('"displayAnswer": "바나나 144개, 사과 233개"','"displayAnswer": "바나나 144개"');
assert.notEqual(displayMutation,read('final3-detailed-data.js'));
assert.equal(load({dataSource:displayMutation}).GFIELD_FINAL3_RESOLVE_SOLUTION(canonical[0],{allowLocked:true}),null,'mutated display binding fails closed');

const diagramMutation=read('final3-solution-diagrams.js').replace('"id": "final3-q1-fruit-branch-recurrence-v1"','"id": "mutated-q1"');
assert.notEqual(diagramMutation,read('final3-solution-diagrams.js'));
assert.equal(load({diagramSource:diagramMutation}).GFIELD_FINAL3_RESOLVE_SOLUTION(canonical[0],{allowLocked:true}),null,'mutated diagram binding fails closed');

const publicText=read('final3-detailed-data.js')+read('final3-solution-diagrams.js');
assert.doesNotMatch(publicText,/\.private-work|sha256|canonicalParser|semanticValue|sourceFiles|비공개|프로토타입|검수 전|표현 검수 대기/i);
assert.match(data.items.find(item=>item.no===13).read,/별 칸/);
assert.doesNotMatch(data.items.find(item=>item.no===13).read,/벌 칸/);

const review=JSON.parse(read('qa/final3-detailed-review.json'));
assert.equal(review.reviewId,data.contract.reviewId);
assert.deepEqual(review.selectedNos,Array.from({length:15},(_,i)=>i+1));
assert.deepEqual(review.pendingNos,Array.from({length:15},(_,i)=>i+16));
assert.equal(review.status.evidence,'verified');
assert.equal(review.status.independentSecondPass,'verified');
assert.equal(review.status.release,'eligible');
assert.equal(review.status.published,true);
assert.deepEqual(review.learnerFitGate.criteria,['language','representations','prerequisites','reasoning-load','response-mode']);
for(const row of review.items){
  const item=data.items.find(entry=>entry.no===row.no);
  assert.ok(item);
  assert.equal(row.canonicalAnswer,item.answer);
  assert.equal(row.displayAnswer,item.displayAnswer);
  assert.equal(row.sourceLocator,item.sourceLocator);
  assert.equal(row.representation&&row.representation.diagramId,item.diagram);
}

console.log('Final3 detailed data QA: PASS (15 public reviewed, exact canonical/display bindings, seven fail-closed diagrams)');
