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
  const overrideMarker='var REVIEWED_TAXONOMY_OVERRIDES = Object.freeze([]);';
  const overrideReplacement='var REVIEWED_TAXONOMY_OVERRIDES = Object.freeze('+JSON.stringify(overrides)+');';
  const subareaMarker='var REVIEWED_ADDITIONAL_SUBAREAS = Object.freeze([]);';
  const subareaReplacement='var REVIEWED_ADDITIONAL_SUBAREAS = Object.freeze('+JSON.stringify(additionalSubareas)+');';
  assert.ok(source.includes(overrideMarker),'empty reviewed-taxonomy list marker exists');
  assert.ok(source.includes(subareaMarker),'empty reviewed-subarea list marker exists');
  const box={module:{exports:{}},exports:{}};
  box.globalThis=box;
  vm.createContext(box);
  vm.runInContext(source.replace(overrideMarker,overrideReplacement).replace(subareaMarker,subareaReplacement),box,{filename:'bank-registry.fixture.js',timeout:3000});
  return box.module.exports;
}

const models=loadModels();
const baseline=registry.buildUnifiedCatalog(models);
const final2=baseline.items.filter(item=>item.sourceRef.set==='final'&&item.sourceRef.round===2);

assert.deepEqual(registry.reviewedTaxonomyOverrides,[],'no real taxonomy approval is published yet');
assert.deepEqual(registry.reviewedAdditionalSubareas,[],'no reviewed additional subarea is published yet');
assert.equal(hash(baseline),EMPTY_CATALOG_SHA256,'empty reviewed list leaves the complete current catalogue byte-equivalent');
assert.equal(baseline.summary.sourceQuestions,840);
assert.equal(baseline.summary.confirmedItems,120);
assert.equal(baseline.summary.candidateItems,720);
assert.equal(final2.length,30);
assert.equal(hash(baseline.items.filter(item=>!(item.sourceRef.set==='final'&&item.sourceRef.round===2))),NON_FINAL2_ITEMS_SHA256,'the other 810 source items have an exact preservation baseline');
assert.ok(final2.every(item=>item.reviewStatus==='candidate'&&item.reviewRequired===true),'all Final2 taxonomy remains candidate while approval list is empty');
assert.ok(final2.every(item=>item.detailType===item.displayType),'empty list preserves every Final2 display/detail type');

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

registry.reviewedTaxonomyOverrides.push(approved);
registry.reviewedAdditionalSubareas.push(reviewedNewSubarea);
assert.equal(hash(registry.buildUnifiedCatalog(models)),EMPTY_CATALOG_SHA256,'the exported reviewed list is a clone, not a runtime mutation surface');
assert.equal(hash(baseline),EMPTY_CATALOG_SHA256,'fixture checks never mutate the baseline catalogue');
assert.doesNotMatch(fs.readFileSync(REGISTRY_PATH,'utf8'),/\.private-work|sourceMemoryQuery|sha256AtAuthoring/i,'public registry exposes no private locator or source fingerprint');

console.log('PASS Final2 taxonomy integration shell: empty lists preserve 840 items and the other 810; stable key/label overrides and reviewed new subareas work; mismatch, unapproved, duplicate, unknown and cross-round cases fail closed');
