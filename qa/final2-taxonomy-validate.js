'use strict';

// Synthetic taxonomy approvals only. No private source or learner record is read.
const assert=require('node:assert/strict');
const crypto=require('node:crypto');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

const ROOT=path.resolve(__dirname,'..');
const REGISTRY_PATH=path.join(ROOT,'bank','bank-registry.js');
const EMPTY_CATALOG_SHA256='c9f76cb6110106653ac05b4801333a6bfbfa73c6d7d59fa6e5a5d057f954b522';
const NON_FINAL2_ITEMS_SHA256='39176d995a32b54a0f540ea9ffc945c4ed1493a9c68d45a501d1284f653f6a5e';
const registry=require(REGISTRY_PATH);
const plain=value=>JSON.parse(JSON.stringify(value));
const hash=value=>crypto.createHash('sha256').update(JSON.stringify(value)).digest('hex');

function loadModels(){
  const box={window:{}};
  vm.createContext(box);
  ['mock-data.js','mock-data-hw.js','mock-data-final.js','last-score-data.js','mock-data-original.js'].forEach(filename=>{
    vm.runInContext(fs.readFileSync(path.join(ROOT,filename),'utf8'),box,{filename,timeout:3000});
  });
  return {
    middle:plain(box.window.GFIELD_MOCK),
    applied:plain(box.window.GFIELD_MOCK_HW),
    final:plain(box.window.GFIELD_MOCK_FINAL),
    last:plain(box.window.GFIELD_LAST_SCORE_DATA),
    original:plain(box.window.GFIELD_MOCK_ORIGINAL)
  };
}

function registryWithMemoryFixture(overrides,additionalSubareas=[]){
  const source=fs.readFileSync(REGISTRY_PATH,'utf8');
  const overridePattern=/\/\* reviewed-taxonomy-overrides:start \*\/[\s\S]*?\/\* reviewed-taxonomy-overrides:end \*\//;
  const subareaPattern=/\/\* reviewed-additional-subareas:start \*\/[\s\S]*?\/\* reviewed-additional-subareas:end \*\//;
  assert.equal((source.match(overridePattern)||[]).length,1,'one reviewed-taxonomy projection block exists');
  assert.equal((source.match(subareaPattern)||[]).length,1,'one reviewed-subarea projection block exists');
  const overrideReplacement='/* reviewed-taxonomy-overrides:start */\n  var REVIEWED_TAXONOMY_OVERRIDES = Object.freeze('+JSON.stringify(overrides)+');\n  /* reviewed-taxonomy-overrides:end */';
  const subareaReplacement='/* reviewed-additional-subareas:start */\n  var REVIEWED_ADDITIONAL_SUBAREAS = Object.freeze('+JSON.stringify(additionalSubareas)+');\n  /* reviewed-additional-subareas:end */';
  const box={module:{exports:{}},exports:{}};
  box.globalThis=box;
  vm.createContext(box);
  vm.runInContext(source.replace(overridePattern,overrideReplacement).replace(subareaPattern,subareaReplacement),box,{filename:'bank-registry.fixture.js',timeout:3000});
  return box.module.exports;
}

const models=loadModels();
const emptyRegistry=registryWithMemoryFixture([],[]);
const baseline=plain(emptyRegistry.buildUnifiedCatalog(models));
const published=plain(registry.buildUnifiedCatalog(models));
const final2Before=baseline.items.filter(item=>item.sourceRef.set==='final'&&item.sourceRef.round===2);
const final2=published.items.filter(item=>item.sourceRef.set==='final'&&item.sourceRef.round===2);

assert.equal(hash(baseline),EMPTY_CATALOG_SHA256,'empty reviewed list leaves the complete current catalogue byte-equivalent');
assert.equal(baseline.summary.sourceQuestions,840);
assert.equal(baseline.summary.confirmedItems,120);
assert.equal(baseline.summary.candidateItems,720);
assert.equal(final2.length,30);
assert.equal(hash(baseline.items.filter(item=>!(item.sourceRef.set==='final'&&item.sourceRef.round===2))),NON_FINAL2_ITEMS_SHA256,'the other 810 source items have an exact preservation baseline');
assert.ok(final2Before.every(item=>item.reviewStatus==='candidate'&&item.reviewRequired===true),'empty fixture keeps every Final2 taxonomy candidate');
assert.ok(final2Before.every(item=>item.detailType===item.displayType),'empty fixture preserves every Final2 display/detail type');

assert.equal(registry.reviewedTaxonomyOverrides.length,30,'thirty independently reviewed Final2 source overrides are published');
assert.deepEqual(registry.reviewedTaxonomyOverrides.map(row=>row.sourceKey),Array.from({length:30},(_,index)=>`final|2|${index+1}`),'only exact Final2 Q1-Q30 source keys are approved');
assert.equal(registry.reviewedAdditionalSubareas.length,6,'six independently reviewed area/subarea pairs are published');
assert.deepEqual(registry.reviewedAdditionalSubareas.map(row=>[row.area,row.subarea]),[
  ['식의 계산','간격·자르기'],['식의 계산','포함과 배제'],['식의 계산','경기 수 계산'],
  ['수·규칙찾기','운반과 소비'],['수·규칙찾기','나이 계산'],['경우의 수','모든 도로 지나기']
]);
assert.equal(published.summary.sourceQuestions,840);
assert.equal(published.summary.confirmedItems,150);
assert.equal(published.summary.candidateItems,690);
assert.ok(final2.every(item=>item.reviewStatus==='confirmed'&&item.reviewRequired===false),'all and only reviewed Final2 taxonomy is confirmed');
assert.equal(hash(published.items.filter(item=>!(item.sourceRef.set==='final'&&item.sourceRef.round===2))),NON_FINAL2_ITEMS_SHA256,'the published projection leaves every other 810 source item byte-equivalent');
const allowedFinal2Changes=['subarea','subareaId','detailType','taxonomyPath','typeFamilyId','typeFamilyLabel','canonicalTypeId','reviewStatus','reviewRequired','reviewBasis','reviewReasons'];
final2.forEach((item,index)=>{
  const before=final2Before[index];
  assert.equal(item.sourceKey,before.sourceKey);
  const restored=plain(item);
  delete restored.detailTypeKey;
  allowedFinal2Changes.forEach(key=>{restored[key]=plain(before[key]);});
  assert.deepEqual(restored,before,`${item.sourceKey} changes only approved taxonomy projection fields`);
  assert.equal(item.canonicalTypeId,registry.stableId(registry.signature(item.area,item.subarea,item.detailTypeKey)),`${item.sourceKey} stable id uses the reviewed key, not the learner label`);
});
assert.deepEqual({
  q4:[final2[3].subarea,final2[3].detailType],
  q15:[final2[14].detailTypeKey,final2[14].detailType],
  q23:[final2[22].subarea,final2[22].detailType],
  q28:[final2[27].subarea,final2[27].detailType]
},{
  q4:['관찰과 분류','중복 선택 가능한 두 화폐의 서로 다른 합 분류하기'],
  q15:['tuple-sequence-cumulative-prior-link-sum-response','여러 수 묶음의 누적·앞 묶음 연결 규칙으로 묶음의 합 구하기'],
  q23:['운반과 소비','되돌아오는 도우미의 소비량까지 포함해 사막 횡단 최소 인원 구하기'],
  q28:['모든 도로 지나기','모든 도로를 지나 출발점으로 돌아오는 가장 짧은 길 찾기']
});

assert.deepEqual(registry.reviewedTaxonomyOverrideContract.requiredStatuses,{
  workStatus:'complete',evidenceStatus:'verified',releaseStatus:'eligible'
});
assert.deepEqual(registry.reviewedTaxonomyOverrideContract.sourceIdentityFields,['sourceKey','area','displayType']);
assert.deepEqual(registry.reviewedTaxonomyOverrideContract.classificationFields,[
  'subarea','detailTypeKey','studentDisplayName','canonicalTypeId','detailTypeScope','itemSpecificNumericIdentity'
]);
assert.deepEqual(registry.reviewedAdditionalSubareaContract.requiredStatuses,{
  workStatus:'complete',evidenceStatus:'verified',releaseStatus:'eligible'
});
assert.deepEqual(registry.reviewedAdditionalSubareaContract.identityFields,['area','subarea']);

const before=baseline.items.find(item=>item.sourceKey==='final|2|1');
const otherRoundBefore=baseline.items.find(item=>item.sourceKey==='final|3|1');
const detailTypeKey='assumption-two-score-total';
const studentDisplayName='두 가지 점수의 총점에서 높은 점수 횟수 구하기';
const approved={
  sourceKey:before.sourceKey,
  area:before.area,
  displayType:before.displayType,
  subarea:'우기기/가정하여 풀기',
  detailTypeKey,
  studentDisplayName,
  canonicalTypeId:registry.stableId(registry.signature(before.area,'우기기/가정하여 풀기',detailTypeKey)),
  detailTypeScope:'reusable',
  itemSpecificNumericIdentity:false,
  workStatus:'complete',
  evidenceStatus:'verified',
  releaseStatus:'eligible'
};

const fixtureRegistry=registryWithMemoryFixture([approved]);
const withApproval=plain(fixtureRegistry.buildUnifiedCatalog(models));
const after=withApproval.items.find(item=>item.sourceKey===approved.sourceKey);
assert.equal(after.area,before.area,'statistical major area is preserved');
assert.equal(after.displayType,before.displayType,'original display type is preserved');
assert.equal(after.sourceSubarea,before.sourceSubarea,'original source subarea is preserved separately');
assert.equal(after.subarea,approved.subarea);
assert.equal(after.detailTypeKey,approved.detailTypeKey);
assert.equal(after.detailType,approved.studentDisplayName);
assert.equal(after.canonicalTypeId,approved.canonicalTypeId);
assert.deepEqual(after.taxonomyPath,{major:before.area,minor:approved.subarea,detail:approved.studentDisplayName});
assert.equal(after.reviewStatus,'confirmed');
assert.equal(after.reviewRequired,false);
assert.equal(after.reviewBasis,'independently reviewed source-specific taxonomy override');
assert.deepEqual(after.reviewReasons,[]);
for(const key of ['sourceKey','sourceRef','objectiveTypeId','objectiveTypeBasis','points','pointBand','responseRate','responseRateBand','responseRateStatus','responseRateUse','bankDifficulty','difficultyClass','paperContextKey','searchEvidence','hasApprovedAnswer']){
  assert.deepEqual(after[key],before[key],key+' is unchanged by taxonomy review');
}
assert.deepEqual(
  withApproval.items.find(item=>item.sourceKey==='final|3|1'),
  otherRoundBefore,
  'an approved Final2 source key never propagates to the same question number in another round'
);
assert.equal(withApproval.summary.sourceQuestions,baseline.summary.sourceQuestions);
assert.equal(withApproval.summary.measuredResponseRateItems,baseline.summary.measuredResponseRateItems);
assert.equal(withApproval.summary.confirmedItems,baseline.summary.confirmedItems+1);
assert.equal(withApproval.summary.candidateItems,baseline.summary.candidateItems-1);
assert.equal(hash(withApproval.items.filter(item=>!(item.sourceRef.set==='final'&&item.sourceRef.round===2))),NON_FINAL2_ITEMS_SHA256,'an approved Final2 fixture leaves all other 810 source items byte-equivalent');

const reviewedNewSubarea={
  area:before.area,
  subarea:'합성 검수 소영역',
  workStatus:'complete',
  evidenceStatus:'verified',
  releaseStatus:'eligible'
};
const newSubareaApproval={
  ...approved,
  subarea:reviewedNewSubarea.subarea,
  canonicalTypeId:registry.stableId(registry.signature(before.area,reviewedNewSubarea.subarea,detailTypeKey))
};
const newSubareaRegistry=registryWithMemoryFixture([newSubareaApproval],[reviewedNewSubarea]);
const withNewSubarea=plain(newSubareaRegistry.buildUnifiedCatalog(models));
const newSubareaAfter=withNewSubarea.items.find(item=>item.sourceKey===before.sourceKey);
assert.equal(newSubareaAfter.reviewStatus,'confirmed','a source-specific override can use a separately reviewed new subarea');
assert.equal(newSubareaAfter.subarea,reviewedNewSubarea.subarea);
assert.ok(newSubareaRegistry.taxonomy[before.area].includes(reviewedNewSubarea.subarea),'the reviewed subarea is visible in the effective public taxonomy');
assert.equal(hash(withNewSubarea.items.filter(item=>!(item.sourceRef.set==='final'&&item.sourceRef.round===2))),NON_FINAL2_ITEMS_SHA256,'registering a reviewed Final2 subarea leaves all other 810 source items byte-equivalent');

const collisionModels=plain(models);
const collisionRaw=collisionModels.final.rounds['3'].items.find(item=>Number(item.no)===1);
collisionRaw.subarea=reviewedNewSubarea.subarea;
const collisionBaseline=plain(registry.buildUnifiedCatalog(collisionModels)).items.find(item=>item.sourceKey==='final|3|1');
const collisionAfter=plain(newSubareaRegistry.buildUnifiedCatalog(collisionModels)).items.find(item=>item.sourceKey==='final|3|1');
assert.deepEqual(collisionAfter,collisionBaseline,'a reviewed added subarea never auto-confirms an unapproved source-authored match in another round');
assert.equal(collisionAfter.reviewStatus,'candidate');
assert.equal(collisionAfter.reviewRequired,true);

function rejectedNewSubarea(label,additionalSubareas){
  const candidateRegistry=registryWithMemoryFixture([newSubareaApproval],additionalSubareas);
  const candidateCatalog=plain(candidateRegistry.buildUnifiedCatalog(models));
  assert.deepEqual(candidateCatalog.items.find(item=>item.sourceKey===before.sourceKey),before,label);
}

rejectedNewSubarea('a locked new subarea cannot become an override target',[{...reviewedNewSubarea,releaseStatus:'locked'}]);
rejectedNewSubarea('an unverified new subarea cannot become an override target',[{...reviewedNewSubarea,evidenceStatus:'draft'}]);
rejectedNewSubarea('a duplicate new-subarea registration fails closed',[reviewedNewSubarea,{...reviewedNewSubarea}]);
rejectedNewSubarea('a new subarea under an unknown major area fails closed',[{...reviewedNewSubarea,area:'미등록 대영역'}]);

function rejected(label,overrides,items=baseline.items){
  assert.deepEqual(registry.applyReviewedTaxonomyOverrides(items,overrides),items,label);
}

rejected('unknown source key stays on the existing fallback',[{...approved,sourceKey:'final|2|999'}]);
rejected('source key cannot borrow another round identity',[{...approved,sourceKey:'final|3|1'}]);
rejected('original major-area mismatch is rejected',[{...approved,area:'경우의 수'}]);
rejected('original display-type mismatch is rejected',[{...approved,displayType:'비슷한 키워드'}]);
rejected('unfinished work is rejected',[{...approved,workStatus:'in-progress'}]);
rejected('unverified evidence is rejected',[{...approved,evidenceStatus:'draft'}]);
rejected('unapproved release is rejected',[{...approved,releaseStatus:'locked'}]);
rejected('unregistered subarea is rejected',[{...approved,subarea:'새 소영역'}]);
rejected('unstable canonical type id is rejected',[{...approved,canonicalTypeId:'type-handwritten'}]);
rejected('an item-specific numeric identity claim is rejected',[{...approved,itemSpecificNumericIdentity:true}]);
rejected('an unreviewed detail-type scope is rejected',[{...approved,detailTypeScope:'item-specific'}]);
rejected('missing stable detail type key is rejected',[{...approved,detailTypeKey:''}]);
rejected('student label cannot be reused as the stable key',[{
  ...approved,
  detailTypeKey:approved.studentDisplayName,
  canonicalTypeId:registry.stableId(registry.signature(approved.area,approved.subarea,approved.studentDisplayName))
}]);
rejected('duplicate approval records fail closed',[approved,{...approved}]);

const duplicateSourceItems=baseline.items.concat([{...before}]);
rejected('duplicate source items fail closed',[approved],duplicateSourceItems);
const brokenIdentityItems=baseline.items.map(item=>item.sourceKey===approved.sourceKey
  ? {...item,sourceRef:{...item.sourceRef,round:3}}
  : item);
rejected('sourceRef and sourceKey disagreement fails closed',[approved],brokenIdentityItems);

const numericConceptItem={
  ...before,
  sourceKey:'fixture|1|1',
  sourceRef:{set:'fixture',round:1,no:1},
  area:'도형',
  displayType:'합성 격자 유형',
  sourceSubarea:null,
  reviewStatus:'candidate',
  reviewRequired:true
};
const numericConceptKey='grid-3x3-symmetry';
const numericConceptDetail='3×3 격자의 회전·뒤집기 분류';
const numericConceptApproval={
  ...approved,
  sourceKey:numericConceptItem.sourceKey,
  area:numericConceptItem.area,
  displayType:numericConceptItem.displayType,
  subarea:'도형 덮기',
  detailTypeKey:numericConceptKey,
  studentDisplayName:numericConceptDetail,
  canonicalTypeId:registry.stableId(registry.signature(numericConceptItem.area,'도형 덮기',numericConceptKey))
};
const numericConceptAfter=registry.applyReviewedTaxonomyOverrides([numericConceptItem],[numericConceptApproval])[0];
assert.equal(numericConceptAfter.detailType,numericConceptDetail,'a concept-defining number is allowed after reusable-type review');
assert.equal(numericConceptAfter.reviewStatus,'confirmed');

const renamed=registry.applyReviewedTaxonomyOverrides([numericConceptItem],[{
  ...numericConceptApproval,
  studentDisplayName:'정사각 격자를 돌리거나 뒤집어 같은 모양 분류하기'
}])[0];
assert.notEqual(renamed.detailType,numericConceptAfter.detailType,'student-facing wording may be refined');
assert.equal(renamed.canonicalTypeId,numericConceptAfter.canonicalTypeId,'student-facing wording never changes the stable cumulative type id');

const confirmed=baseline.items.find(item=>item.sourceKey==='final|1|1');
const confirmedDetail='자리 조건을 만족하는 수 세기';
rejected('already confirmed source taxonomy is not overwritten',[{
  ...approved,
  sourceKey:confirmed.sourceKey,
  area:confirmed.area,
  displayType:confirmed.displayType,
  subarea:confirmed.subarea,
  detailTypeKey:'two-digit-condition-count',
  studentDisplayName:confirmedDetail,
  canonicalTypeId:registry.stableId(registry.signature(confirmed.area,confirmed.subarea,'two-digit-condition-count'))
}]);

const publishedCatalogHash=hash(published);
registry.reviewedTaxonomyOverrides.push(approved);
registry.reviewedAdditionalSubareas.push(reviewedNewSubarea);
assert.equal(hash(registry.buildUnifiedCatalog(models)),publishedCatalogHash,'the exported reviewed list is a clone, not a runtime mutation surface');
assert.equal(hash(baseline),EMPTY_CATALOG_SHA256,'fixture checks never mutate the baseline catalogue');
assert.doesNotMatch(fs.readFileSync(REGISTRY_PATH,'utf8'),/\.private-work|sourceMemoryQuery|sha256AtAuthoring/i,'public registry exposes no private locator or source fingerprint');

console.log('PASS Final2 taxonomy integration: reviewed Final2 30 confirmed with stable key/learner label separation and six source-bound subareas; empty baseline and other 810 preserved; mismatch, unapproved, duplicate, unknown and cross-round cases fail closed');
