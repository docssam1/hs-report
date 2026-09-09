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
  if(!options.withoutDiagrams){
    vm.runInContext(options.diagramSource||read('final3-solution-diagrams.js'),box,{filename:'final3-solution-diagrams.js'});
    if(!options.withoutBackhalfDiagrams) vm.runInContext(options.backDiagramSource||read('final3-backhalf-solution-diagrams.js'),box,{filename:'final3-backhalf-solution-diagrams.js'});
  }
  vm.runInContext(options.dataSource||read('final3-detailed-data.js'),box,{filename:'final3-detailed-data.js'});
  return box.window;
}

const expectedAnswers=new Map([
  [1,['144,233','바나나 144개, 사과 233개']],[2,['성은','성은']],[3,['188','검은 타일 188개']],
  [4,['오른손 중지','오른손 중지']],[5,['목요일','목요일']],[6,['21','21개']],[7,['원, 1','동그라미 1개']],
  [8,['5544','5544가지']],[9,['15,9,36,4','15, 9, 36, 4']],[10,['124','124개']],[11,['118','118']],
  [12,['9','9개']],[13,['377','377가지']],[14,['35,21','관호 35살, 주연 21살']],[15,['13','13']],
  [16,['964','964']],[17,['240','240']],[18,['4','4m']],[19,['14','14개']],[20,['12','12가지']],
  [21,['7행 16열','7행 16열']],[22,['150','150']],[23,['49','49번째']],
  [24,['614','ㄱ=6, ㄴ=1, ㄷ=4, ㄹ=2, ㅁ=5, ㅂ=3, ㅅ=8, ㅇ=9']],[25,['19','19가지']],
  [26,['5','5가지']],[27,['12,4,1','친구 12명, 한 사람당 사과 4개와 귤 1개']],[28,['72','72']],
  [29,['18분','18분']],[30,['4','4색']]
]);
const diagramNos=new Set([1,3,4,6,7,8,13,17,18,19,24,25,26,30]);
const live=load();
const data=live.GFIELD_FINAL3_DETAILED;
const canonical=live.GFIELD_MOCK_FINAL.rounds[3].items;
const resolve=live.GFIELD_FINAL3_RESOLVE_SOLUTION;

assert.equal(data.contract.round,3);
assert.equal(data.contract.expectedCount,30);
assert.equal(data.contract.totalQuestions,30);
assert.equal(data.contract.evidenceStatus,'verified');
assert.equal(data.contract.independentReviewStatus,'verified');
assert.equal(data.contract.releaseStatus,'eligible');
assert.deepEqual(Array.from(data.contract.expectedNos),Array.from({length:30},(_,i)=>i+1));
assert.deepEqual(Array.from(data.contract.learnerFitCriteria),['language','representations','prerequisites','reasoning-load','response-mode']);
assert.equal(data.items.length,30);
assert.equal(new Set(data.items.map(item=>item.no)).size,30);

for(const item of data.items){
  const pair=expectedAnswers.get(item.no);
  assert.ok(pair,'unexpected item '+item.no);
  assert.equal(item.answer,pair[0],'canonical answer '+item.no);
  assert.equal(item.displayAnswer,pair[1],'display answer '+item.no);
  const page=item.no<=4?'001':item.no<=9?'002':item.no<=15?'003':item.no<=19?'004':item.no<=24?'005':item.no<=28?'006':'007';
  assert.equal(item.sourceLocator,'materials/final_3/'+page+'.jpg#q'+item.no);
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
assert.equal(resolve({...canonical[0],no:31},{allowLocked:true}),null,'unknown question remains unavailable');

const noDiagrams=load({withoutDiagrams:true});
for(const no of diagramNos) assert.equal(noDiagrams.GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===no),{allowLocked:true}),null,'missing diagram locks '+no);
assert.ok(noDiagrams.GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===2),{allowLocked:true}),'text-only item does not need diagram renderer');
const noBackhalfDiagrams=load({withoutBackhalfDiagrams:true});
assert.equal(noBackhalfDiagrams.GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===17),{allowLocked:true}),null,'missing back-half diagram locks Q17');
assert.ok(noBackhalfDiagrams.GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===16),{allowLocked:true}),'back-half text-only item remains available');

const displayMutation=read('final3-detailed-data.js').replace('"displayAnswer": "바나나 144개, 사과 233개"','"displayAnswer": "바나나 144개"');
assert.notEqual(displayMutation,read('final3-detailed-data.js'));
assert.equal(load({dataSource:displayMutation}).GFIELD_FINAL3_RESOLVE_SOLUTION(canonical[0],{allowLocked:true}),null,'mutated display binding fails closed');

const diagramMutation=read('final3-solution-diagrams.js').replace('"id": "final3-q1-fruit-branch-recurrence-v1"','"id": "mutated-q1"');
assert.notEqual(diagramMutation,read('final3-solution-diagrams.js'));
assert.equal(load({diagramSource:diagramMutation}).GFIELD_FINAL3_RESOLVE_SOLUTION(canonical[0],{allowLocked:true}),null,'mutated diagram binding fails closed');
const backDiagramMutation=read('final3-backhalf-solution-diagrams.js').replace('"id": "final3-q17-fixed-rectangles-v1"','"id": "mutated-q17"');
assert.notEqual(backDiagramMutation,read('final3-backhalf-solution-diagrams.js'));
assert.equal(load({backDiagramSource:backDiagramMutation}).GFIELD_FINAL3_RESOLVE_SOLUTION(canonical.find(row=>row.no===17),{allowLocked:true}),null,'mutated back-half diagram binding fails closed');

const publicText=read('final3-detailed-data.js')+read('final3-solution-diagrams.js')+read('final3-backhalf-solution-diagrams.js');
assert.doesNotMatch(publicText,/\.private-work|sha256|canonicalParser|semanticValue|sourceFiles|비공개|프로토타입|검수 전|표현 검수 대기/i);
assert.match(data.items.find(item=>item.no===13).read,/별 칸/);
assert.doesNotMatch(data.items.find(item=>item.no===13).read,/벌 칸/);

const review=JSON.parse(read('qa/final3-detailed-review.json'));
assert.equal(review.reviewId,data.contract.reviewId);
assert.deepEqual(review.selectedNos,Array.from({length:30},(_,i)=>i+1));
assert.deepEqual(review.pendingNos,[]);
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

assert.equal(data.items.find(item=>item.no===30).displayAnswer,'4색');
assert.match(data.items.find(item=>item.no===30).check,/42쌍/u);
assert.doesNotMatch(data.items.find(item=>item.no===30).check,/최소는 4개/u);

console.log('Final3 detailed data QA: PASS (30 public reviewed, exact canonical/display bindings, fourteen fail-closed diagrams)');
