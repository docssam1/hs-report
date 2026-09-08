'use strict';

const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const EXPECTED=[1,2,3,4,5,6,7,8,9,10,11,12,13,14,15,16,17,18,19,20,21,22,23,24,25,26,27,28,29,30];
const RELEASED23=[1,3,4,6,7,8,10,11,12,15,18,19,20,21,22,23,24,25,26,27,28,29,30];
const REQUIRED_DIAGRAMS=new Map([
  [2,'final2-q2-alternating-square-chain-v1'],
  [5,'final2-q5-point-contact-coloring-v1'],
  [9,'final2-q9-five-edge-cuboid-paths-v1'],
  [12,'top-projection'],
  [13,'final2-q13-road-network-v1'],
  [16,'final2-q16-l-tromino-orbits-v1'],
  [28,'q28-weighted-road-graph-v1']
]);
const REVIEW_ID='final2-detailed-review-20260909';
const LEARNER_STAGE='초등 선발 대비 파이널 모의고사 수강생';
const RELEASED23_EDUCATION_SHA256='f4dcca9f407a57c555b4723fa8101e322f29a219e5a9416a818b3e96a3183f53';
const Q5_PUBLIC_PROJECTION_SHA256='1a1e8f8714c0de02a35b0e04015e9139c4bc2564505c17eb7ca9644d87c37acd';

const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));

function demoteForNegativeControl(source){
  const transformed=source
    .replace("independentReviewStatus:'verified'","independentReviewStatus:'pending-final-representation-review'")
    .replace("releaseStatus:'eligible'","releaseStatus:'locked'");
  assert.notEqual(transformed,source,'negative control must demote the two exact approval gates');
  return transformed;
}

function suppressDiagram(source,no){
  return source+
    "\n;(function(root){"+
    "var original=root.GFIELD_FINAL2_SOLUTION_DIAGRAMS;"+
    "root.GFIELD_FINAL2_SOLUTION_DIAGRAMS=Object.assign({},original,{render:function(value){"+
    "return Number(value)==="+Number(no)+"?'':original.render(value);"+
    "}});"+
    "})(typeof window!=='undefined'?window:globalThis);\n";
}

function load(options={}){
  const sandbox={window:{},console};
  vm.createContext(sandbox);
  vm.runInContext(read('mock-data-final.js'),sandbox,{filename:'mock-data-final.js'});
  if(options.diagram!==false){
    const diagramSource=options.suppressDiagram==null
      ? read('final2-solution-diagrams.js')
      : suppressDiagram(read('final2-solution-diagrams.js'),options.suppressDiagram);
    vm.runInContext(diagramSource,sandbox,{filename:'final2-solution-diagrams.js'});
  }
  let dataSource=read('final2-detailed-data.js');
  if(options.demote) dataSource=demoteForNegativeControl(dataSource);
  if(typeof options.transformData==='function') dataSource=options.transformData(dataSource);
  vm.runInContext(dataSource,sandbox,{filename:'final2-detailed-data.js'});
  return sandbox.window;
}

const publicRoot=load();
const mock=publicRoot.GFIELD_MOCK_FINAL;
const publicData=publicRoot.GFIELD_FINAL2_DETAILED;
const publicResolve=publicRoot.GFIELD_FINAL2_RESOLVE_SOLUTION;
assert.ok(mock&&publicData&&typeof publicResolve==='function','Final2 reviewed globals load');

const round=mock.rounds[2]||mock.rounds['2'];
assert.ok(round&&Array.isArray(round.items)&&round.items.length===30,'canonical Final2 has 30 items');
const canonicalByNo=new Map(round.items.map(item=>[Number(item.no),item]));

assert.deepEqual(plain(publicData.contract.expectedNos),EXPECTED,'reviewed set is exact and ordered');
assert.equal(publicData.contract.expectedCount,30);
assert.equal(publicData.contract.totalQuestions,30);
assert.equal(publicData.contract.set,'final');
assert.equal(publicData.contract.round,2);
assert.equal(publicData.contract.reviewId,REVIEW_ID);
assert.equal(publicData.contract.learnerStage,LEARNER_STAGE);
assert.equal(publicData.contract.evidenceStatus,'verified');
assert.equal(publicData.contract.independentReviewStatus,'verified');
assert.equal(publicData.contract.releaseStatus,'eligible');
assert.equal(publicData.contract.answerVisibility,'post-attempt-only');
assert.equal(publicData.contract.scope,'selected-detail-only');
assert.ok(Object.isFrozen(publicData)&&Object.isFrozen(publicData.contract)&&Object.isFrozen(publicData.items),'reviewed data is immutable');

for(const canonical of round.items){
  assert.ok(publicResolve(canonical),'reviewed public data resolves Q'+canonical.no);
}

const nos=publicData.items.map(item=>item.no);
assert.deepEqual(plain(nos),EXPECTED);
assert.equal(new Set(nos).size,nos.length,'integrated numbers are unique');
const detailByNo=new Map(publicData.items.map(item=>[item.no,item]));

const SOURCE_PAGES={};
for(const no of [1,2,3,4,5,6]) SOURCE_PAGES[no]='materials/final_2/001.jpg';
for(const no of [7,8,9,10,11,12]) SOURCE_PAGES[no]='materials/final_2/002.jpg';
for(const no of [13,14,15,16,17,18]) SOURCE_PAGES[no]='materials/final_2/003.jpg';
for(const no of [19,20,21,22,23,24]) SOURCE_PAGES[no]='materials/final_2/004.jpg';
for(const no of [25,26,27,28]) SOURCE_PAGES[no]='materials/final_2/005.jpg';
for(const no of [29,30]) SOURCE_PAGES[no]='materials/final_2/006.jpg';

for(const item of publicData.items){
  const canonical=canonicalByNo.get(item.no);
  assert.ok(canonical,'Q'+item.no+' exists in canonical data');
  assert.equal(item.answer,String(canonical.answer),'Q'+item.no+' answer is bound to canonical data');
  assert.equal(item.reviewStatus,'verified');
  assert.equal(item.evidenceStatus,'verified');
  assert.equal(item.independentReviewStatus,'verified');
  assert.equal(item.releaseStatus,'eligible');
  assert.equal(item.reviewId,REVIEW_ID);
  assert.equal(item.learnerStage,LEARNER_STAGE);
  assert.equal(item.answerVisibility,'post-attempt-only');
  assert.equal(item.sourceLocator.split('#')[0],SOURCE_PAGES[item.no],'Q'+item.no+' source page is exact');
  for(const key of ['title','read','method','check','caution','comment','sourceLocator']){
    assert.equal(typeof item[key],'string','Q'+item.no+' '+key+' is text');
    assert.ok(item[key].trim().length>=8,'Q'+item.no+' '+key+' is substantive');
  }
  assert.ok(Array.isArray(item.steps)&&item.steps.length>=3,'Q'+item.no+' has explicit steps');
  for(const step of item.steps){
    assert.ok(step&&typeof step.title==='string'&&step.title.trim());
    assert.ok(typeof step.body==='string'&&step.body.trim().length>=12);
    if(step.table!=null){
      assert.ok(Array.isArray(step.table.headers)&&step.table.headers.length>0);
      assert.ok(Array.isArray(step.table.rows)&&step.table.rows.length>0);
      assert.ok(step.table.rows.every(row=>row.length===step.table.headers.length));
    }
  }
  for(const heading of ['읽을 조건','풀이 전략','검산','주의할 점']){
    assert.ok(item.comment.includes(heading),'Q'+item.no+' compatibility comment includes '+heading);
  }
  item.steps.forEach((step,index)=>{
    assert.ok(item.comment.includes((index+1)+'. '+step.title),'Q'+item.no+' comment includes step '+(index+1));
  });
  assert.doesNotMatch(item.comment,/영상에서|동영상|\\.private|clipboard|sha-?256|[a-f\\d]{64}/i,'Q'+item.no+' exposes no unsupported or private evidence claim');
  assert.ok(fs.existsSync(path.join(ROOT,item.sourceLocator.split('#')[0])),'Q'+item.no+' public source locator exists');
  for(const privateKey of ['diagramModel','learnerFit','sourceCondition','resultContract']){
    assert.equal(item[privateKey],undefined,'Q'+item.no+' does not publish private author metadata '+privateKey);
  }
  if(REQUIRED_DIAGRAMS.has(item.no)){
    assert.equal(item.diagram,REQUIRED_DIAGRAMS.get(item.no),'Q'+item.no+' exact diagram binding');
  }else{
    assert.equal(item.diagram,undefined,'Q'+item.no+' does not invent a diagram dependency');
  }
}

const educationKeys=['no','title','answer','sourceLocator','read','method','steps','check','caution','diagram','comment'];
const releasedProjection=publicData.items
  .filter(item=>RELEASED23.includes(item.no))
  .map(item=>Object.fromEntries(educationKeys.map(key=>[key,item[key]===undefined?null:plain(item[key])])));
const releasedHash=crypto.createHash('sha256').update(JSON.stringify(releasedProjection)).digest('hex');
assert.equal(releasedHash,RELEASED23_EDUCATION_SHA256,'the previously released 23 educational explanations are exact');

assert.deepEqual(
  plain(publicData.items.filter(item=>item.steps.some(step=>step.table)).map(item=>item.no)),
  [2,4,5,7,9,13,15,16,17,18,19,20,21,22,23,24,26,27,28,29],
  'the exact 20 explanations needing compact tabular evidence contain tables'
);
assert.equal(detailByNo.get(2).diagram,'final2-q2-alternating-square-chain-v1');
assert.equal(detailByNo.get(5).diagram,'final2-q5-point-contact-coloring-v1');
assert.match(detailByNo.get(5).read,/‘만나는’에는 한 점에서 닿는 경우도 포함/);
assert.match(detailByNo.get(5).caution,/새 국경선을 그리는 것이 아닙니다/);
const q5Projection=Object.fromEntries(['no','title','answer','sourceLocator','read','method','steps','check','caution','diagram'].map(key=>[key,plain(detailByNo.get(5)[key])]));
assert.equal(crypto.createHash('sha256').update(JSON.stringify(q5Projection)).digest('hex'),Q5_PUBLIC_PROJECTION_SHA256,'Q5 exact independently approved public projection');
assert.equal(detailByNo.get(9).diagram,'final2-q9-five-edge-cuboid-paths-v1');
assert.equal(detailByNo.get(13).diagram,'final2-q13-road-network-v1');
assert.equal(detailByNo.get(16).diagram,'final2-q16-l-tromino-orbits-v1');
assert.match(detailByNo.get(14).steps[0].body,/299×8=2392m/);
assert.match(detailByNo.get(16).method,/가운데 칸을 피한다/);
assert.equal(detailByNo.get(16).steps.length,5);
assert.equal(detailByNo.get(16).steps[2].table.rows.length,6);
assert.deepEqual(plain(detailByNo.get(16).steps[2].table.rows.map(row=>row[4])),['2','1','3','5','4','6']);
assert.match(detailByNo.get(16).check,/16개.*22쌍/);
assert.match(detailByNo.get(16).caution,/돌리는 네 방향.*뒤집은 뒤 돌리는 네 방향/);
assert.match(detailByNo.get(17).steps[2].body,/1번과 7번/);
assert.equal(detailByNo.get(27).check,'표를 순서대로 합치면 5번째 뒤에 A와 E, 6번째 뒤에 B, 7번째 뒤에 C, 8번째 뒤에 D와 F가 ABCDEF를 압니다.');

assert.equal(publicResolve({no:1,answer:'changed-answer'}),null,'answer drift fails closed');
assert.ok(publicResolve(canonicalByNo.get(5)),'approved Q5 resolves publicly');
assert.equal(publicResolve(null),null,'missing item fails closed');

const demoted=load({demote:true});
for(const canonical of round.items){
  assert.equal(demoted.GFIELD_FINAL2_RESOLVE_SOLUTION(canonical),null,'approval demotion fails closed for Q'+canonical.no);
}

const withoutAllDiagrams=load({diagram:false});
for(const [no] of REQUIRED_DIAGRAMS){
  assert.equal(withoutAllDiagrams.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(no)),null,'Q'+no+' without diagram registry fails closed');
}
assert.ok(withoutAllDiagrams.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(14)),'non-diagram item does not depend on registry');

for(const [missingNo] of REQUIRED_DIAGRAMS){
  const rootWithoutOne=load({suppressDiagram:missingNo});
  for(const [no] of REQUIRED_DIAGRAMS){
    const actual=Boolean(rootWithoutOne.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(no)));
    assert.equal(actual,no!==missingNo,'diagram isolation: Q'+no+' when Q'+missingNo+' renderer is suppressed');
  }
}

const incomplete=load({
  transformData:source=>source.replace('expectedCount:30','expectedCount:31')
});
assert.equal(incomplete.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(1)),null,'incomplete contract fails closed');

const duplicated=load({
  transformData:source=>source.replace('      no:26,','      no:25,')
});
assert.equal(duplicated.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(25)),null,'duplicate integrated number fails closed');

const review=JSON.parse(read('qa/final2-detailed-review.json'));
assert.equal(review.reviewId,REVIEW_ID);
assert.equal(review.schemaVersion,2);
assert.equal(review.learnerStage,LEARNER_STAGE);
assert.equal(review.status.evidence,'verified');
assert.equal(review.status.independentSecondPass,'verified');
assert.equal(review.status.release,'eligible');
assert.equal(review.status.published,false);
assert.equal(review.status.answerVisibility,'post-attempt-only');
assert.equal(review.gateLayer,'independent-second-pass-complete');
assert.equal(review.learnerFitGate.gateId,'learner-fit');
assert.equal(review.learnerFitGate.learnerStage,LEARNER_STAGE);
assert.deepEqual(review.learnerFitGate.criteria,['language','representations','prerequisites','reasoning-load','response-mode']);
assert.equal(review.learnerFitGate.status,'pass');
assert.deepEqual(review.learnerFitCriteria,{
  conditionFirst:true,
  strategyBeforeCalculation:true,
  explicitSteps:true,
  checkIncluded:true,
  commonMisreadIncluded:true
});
assert.equal(review.independentReview.status,'verified');
assert.equal(review.independentReview.result,'pass');
assert.deepEqual(review.independentReview.verifiedNos,EXPECTED);
assert.deepEqual(review.independentReview.contentVerifiedNos,EXPECTED);
assert.deepEqual(review.independentReview.pendingRepresentationNos,[]);
assert.deepEqual(review.selectedNos,EXPECTED);
assert.deepEqual(review.pendingNos,[]);
assert.deepEqual(review.items.map(item=>item.no),EXPECTED);
for(const item of review.items){
  assert.equal(item.answerContract,canonicalByNo.get(item.no).answer,'Q'+item.no+' audit answer matches canonical');
  assert.equal(item.sourceLocator,detailByNo.get(item.no).sourceLocator,'Q'+item.no+' review locator matches data');
  assert.equal(item.gates,'pass','Q'+item.no+' review gate state');
}
for(const [no,id] of REQUIRED_DIAGRAMS){
  if(no===12||no===28) continue;
  assert.equal(review.items.find(item=>item.no===no).representation.diagramId,id,'Q'+no+' review diagram ID');
  assert.equal(review.items.find(item=>item.no===no).representation.status,'verified');
}
assert.equal(review.items.find(item=>item.no===12).representation.exactMidpointClaim,false);
assert.equal(review.items.find(item=>item.no===28).representation.edgeCount,18);
assert.deepEqual(review.items.find(item=>item.no===28).representation.duplicateEdges,['AG','CH','EI']);
assert.equal(review.items.find(item=>item.no===28).representation.routeLength,216);
assert.match(review.supersessionBoundary,/eligible 30-question set/);
assert.match(review.supersessionBoundary,/actual 36-page detail and 50-page package PDF review passed/);
assert.match(review.supersessionBoundary,/remaining seven/);
assert.doesNotMatch(JSON.stringify(review),/\\.private|clipboard|[a-f\\d]{64}/i,'public review contains no private locator or fingerprint');

console.log('PASS Final2 reviewed data: exact 30 eligible, released-23 education hash preserved, canonical binding, seven fail-closed diagrams, approved Q5 point contract, and approval-demotion negative control');
