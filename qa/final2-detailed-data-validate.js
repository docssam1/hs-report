'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const EXPECTED=[1,3,4,6,7,8,10,11,12,15,25,26];
const REVIEW_ID='final2-detailed-review-20260909';
const LEARNER_STAGE='초등 선발 대비 파이널 모의고사 수강생';

const read=name=>fs.readFileSync(path.join(ROOT,name),'utf8');
const plain=value=>value===undefined?undefined:JSON.parse(JSON.stringify(value));

function load(options={}){
  const sandbox={window:{},console};
  vm.createContext(sandbox);
  vm.runInContext(read('mock-data-final.js'),sandbox,{filename:'mock-data-final.js'});
  if(options.diagram!==false){
    vm.runInContext(read('final2-solution-diagrams.js'),sandbox,{filename:'final2-solution-diagrams.js'});
  }
  const dataSource=typeof options.transformData==='function'
    ? options.transformData(read('final2-detailed-data.js'))
    : read('final2-detailed-data.js');
  vm.runInContext(dataSource,sandbox,{filename:'final2-detailed-data.js'});
  return sandbox.window;
}

function demoteForNegativeControl(source){
  return source
    .replace("independentReviewStatus:'verified'","independentReviewStatus:'pending'")
    .replace("releaseStatus:'eligible'","releaseStatus:'pending-independent-second-pass'");
}

const root=load();
const mock=root.GFIELD_MOCK_FINAL;
const data=root.GFIELD_FINAL2_DETAILED;
const resolve=root.GFIELD_FINAL2_RESOLVE_SOLUTION;
assert.ok(mock&&data&&typeof resolve==='function','Final2 detail globals load');

const round=mock.rounds[2]||mock.rounds['2'];
assert.ok(round&&Array.isArray(round.items)&&round.items.length===30,'canonical Final2 has 30 items');
const canonicalByNo=new Map(round.items.map(item=>[Number(item.no),item]));

assert.deepEqual(plain(data.contract.expectedNos),EXPECTED,'reviewed set is exact and ordered');
assert.equal(data.contract.expectedCount,EXPECTED.length);
assert.equal(data.contract.totalQuestions,30);
assert.equal(data.contract.set,'final');
assert.equal(data.contract.round,2);
assert.equal(data.contract.reviewId,REVIEW_ID);
assert.equal(data.contract.learnerStage,LEARNER_STAGE);
assert.equal(data.contract.evidenceStatus,'verified');
assert.equal(data.contract.independentReviewStatus,'verified');
assert.equal(data.contract.releaseStatus,'eligible');
assert.equal(data.contract.answerVisibility,'post-attempt-only');
assert.equal(data.contract.scope,'selected-detail-only');
assert.ok(Object.isFrozen(data)&&Object.isFrozen(data.contract)&&Object.isFrozen(data.items),'reviewed data is immutable');

const nos=data.items.map(item=>item.no);
assert.deepEqual(plain(nos),EXPECTED);
assert.equal(new Set(nos).size,nos.length,'reviewed numbers are unique');
const detailByNo=new Map(data.items.map(item=>[item.no,item]));

for(const item of data.items){
  const canonical=canonicalByNo.get(item.no);
  assert.ok(canonical,`Q${item.no} exists in canonical data`);
  assert.equal(item.answer,String(canonical.answer),`Q${item.no} answer is bound to canonical data`);
  assert.equal(item.reviewStatus,'verified');
  assert.equal(item.evidenceStatus,'verified');
  assert.equal(item.independentReviewStatus,'verified');
  assert.equal(item.releaseStatus,'eligible');
  assert.equal(item.reviewId,REVIEW_ID);
  assert.equal(item.learnerStage,LEARNER_STAGE);
  assert.equal(item.answerVisibility,'post-attempt-only');
  for(const key of ['title','read','method','check','caution','comment','sourceLocator']){
    assert.equal(typeof item[key],'string',`Q${item.no} ${key} is text`);
    assert.ok(item[key].trim().length>=8,`Q${item.no} ${key} is substantive`);
  }
  assert.ok(Array.isArray(item.steps)&&item.steps.length>=3,`Q${item.no} has explicit steps`);
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
    assert.ok(item.comment.includes(heading),`Q${item.no} compatibility comment includes ${heading}`);
  }
  item.steps.forEach((step,index)=>{
    assert.ok(item.comment.includes(`${index+1}. ${step.title}`),`Q${item.no} comment includes step ${index+1}`);
  });
  assert.doesNotMatch(item.comment,/영상에서|동영상|\.private|clipboard|sha-?256|[a-f\d]{64}/i,`Q${item.no} exposes no unsupported or private evidence claim`);
  const sourcePath=item.sourceLocator.split('#')[0];
  assert.ok(fs.existsSync(path.join(ROOT,sourcePath)),`Q${item.no} public source locator exists`);
  const resolved=resolve(canonical);
  assert.ok(resolved,`Q${item.no} resolves against canonical item`);
  for(const key of ['no','title','answer','read','method','steps','check','caution','comment','diagram']){
    assert.deepEqual(plain(resolved[key]),plain(item[key]),`Q${item.no} ${key} is unchanged by approval-only control`);
  }
}

assert.match(detailByNo.get(7).caution,/200번째.*199번째/,'Q7 keeps the explicit 200-to-199 correction boundary');
assert.match(detailByNo.get(8).read,/20개씩 든 다발/,'Q8 preserves 20 coins per bundle');
assert.doesNotMatch(detailByNo.get(8).read,/20원짜리/,'Q8 does not turn the bundle size into a denomination');
assert.deepEqual(
  plain(data.items.filter(item=>item.steps.some(step=>step.table)).map(item=>item.no)),
  [4,7,15,26],
  'only the four reviewed explanations that need compact tabular evidence contain tables'
);

for(const canonical of round.items){
  const expected=EXPECTED.includes(Number(canonical.no));
  assert.equal(Boolean(resolve(canonical)),expected,`Q${canonical.no} verified boundary is exact`);
}

assert.equal(resolve({no:1,answer:'changed-answer'}),null,'answer drift fails closed');
assert.equal(resolve({no:2,answer:canonicalByNo.get(2).answer}),null,'unreviewed question fails closed');
assert.equal(resolve(null),null,'missing item fails closed');

const demoted=load({transformData:demoteForNegativeControl});
for(const canonical of round.items){
  assert.equal(Boolean(demoted.GFIELD_FINAL2_RESOLVE_SOLUTION(canonical)),false,`Q${canonical.no} stays hidden when independent approval is removed`);
}

const withoutDiagram=load({diagram:false});
assert.equal(withoutDiagram.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(12)),null,'Q12 without reviewed diagram renderer fails closed');
assert.ok(withoutDiagram.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(1)),'numeric item does not depend on diagram renderer');

const incomplete=load({
  transformData:source=>source.replace('expectedCount:12','expectedCount:13')
});
assert.equal(incomplete.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(1)),null,'incomplete contract fails closed');

const duplicated=load({
  transformData:source=>source.replace('      no:26,','      no:25,')
});
assert.equal(duplicated.GFIELD_FINAL2_RESOLVE_SOLUTION(canonicalByNo.get(25)),null,'duplicate reviewed number fails closed');

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
assert.equal(review.independentReview.status,'verified');
assert.equal(review.independentReview.result,'pass');
assert.deepEqual(review.independentReview.sourcePagesViewed,[
  'materials/final_2/001.jpg',
  'materials/final_2/002.jpg',
  'materials/final_2/003.jpg',
  'materials/final_2/005.jpg'
]);
assert.deepEqual(review.independentReview.verifiedNos,EXPECTED);
assert.ok(review.independentReview.contentCorrections.some(note=>/Q7.*199 rather than 200/.test(note)));
assert.ok(review.independentReview.contentCorrections.some(note=>/Q8.*20 coins per bundle/.test(note)));
assert.deepEqual(review.independentReview.canonicalAnswerConflicts,[]);
assert.equal(review.sourceRenderCongruence.result,'pass');
assert.equal(review.sourceRenderCongruence.pdfPages,6);
assert.equal(review.sourceRenderCongruence.sourceJpegPages,6);
assert.ok(review.sourceRenderCongruence.minimumCorrelation>=0.99,'PDF and source JPEG pages are congruent');
assert.deepEqual(review.selectedNos,EXPECTED);
assert.deepEqual(review.pendingNos,[...Array(30)].map((_,i)=>i+1).filter(no=>!EXPECTED.includes(no)));
assert.deepEqual(review.items.map(item=>item.no),EXPECTED);
for(const item of review.items){
  assert.equal(item.gates,'pass',`Q${item.no} review gates pass`);
  assert.equal(item.answerContract,canonicalByNo.get(item.no).answer,`Q${item.no} audit answer matches canonical`);
  assert.equal(item.sourceLocator,data.items.find(entry=>entry.no===item.no).sourceLocator,`Q${item.no} source locator matches data`);
}
assert.equal(review.items.find(item=>item.no===12).representation.exactMidpointClaim,false);
assert.match(review.supersessionBoundary,/independent second-pass gates/);
assert.match(review.supersessionBoundary,/eligible for post-attempt release/);
assert.match(review.supersessionBoundary,/published=false makes no deployment claim/);
assert.doesNotMatch(JSON.stringify(review),/\.private|clipboard|[a-f\d]{64}/i,'public review contains no private locator or fingerprint');

console.log('PASS Final2 selected detail approval: exact 12, canonical-answer binding, independent-review evidence, eligible post-attempt release, and fail-closed negative controls');
