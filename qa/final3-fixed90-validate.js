'use strict';

const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');

const ROOT=path.resolve(__dirname,'..');
const data=JSON.parse(fs.readFileSync(path.join(ROOT,'bank','data','final3-fixed90.json'),'utf8'));
const index=JSON.parse(fs.readFileSync(path.join(ROOT,'bank','data','final3-fixed90-index.json'),'utf8'));

assert.equal(data.sourceSet,'final');
assert.equal(data.sourceRound,3);
assert.equal(data.items.length,90);
assert.equal(index.items.length,90);
assert.deepEqual(data.reviewSummary,{reviewVersion:'final3-human-review-approved-20260920',verified:90,pending:0});
assert.equal(new Set(data.items.map(item=>item.id)).size,90);
assert.ok(data.items.every(item=>item.reviewStatus==='verified'&&item.releaseStatus==='eligible'));
assert.ok(data.items.every(item=>item.humanReview&&item.humanReview.status==='approved'));
assert.ok(data.items.every(item=>item.verification&&item.verification.unique===true&&item.verification.validAnswerCount===1));
assert.ok(data.items.every(item=>String(item.verification.primary.answer)===String(item.answer)));
assert.ok(data.items.every(item=>String(item.verification.independent.answer)===String(item.answer)));
assert.equal(data.items.filter(item=>item.asset).length,48);
assert.ok(data.items.filter(item=>item.assetSpec).every(item=>item.asset&&/^data:image\/png;base64,/.test(item.asset.src)));
for(let no=1;no<=30;no++){
  const group=data.items.filter(item=>item.sourceNo===no);
  assert.equal(group.length,3,`${no}번 유사문제는 3개여야 합니다.`);
  assert.deepEqual(group.map(item=>item.variantNo),[1,2,3]);
  assert.equal(new Set(group.map(item=>item.itemContentHash)).size,3,`${no}번 세 문항의 수치·답·그림 조건은 서로 달라야 합니다.`);
}
assert.deepEqual(index.items.map(item=>item.id),data.items.map(item=>item.id));
console.log(JSON.stringify({pass:true,items:90,types:30,figures:48,releaseStatus:'eligible'}));
