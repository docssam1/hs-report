'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto'),vm=require('node:vm');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');
const data=JSON.parse(read('bank/data/middle8-reviewed.json'));
const adapter=require('../bank/adapters/middle8-reviewed-adapter.js');
const registry=require('../bank/bank-registry.js');
const personal=require('../bank/personal-mock.js');
assert.equal(data.sourceSet,'middle');assert.equal(data.sourceRound,8);
assert.equal(data.items.length,90);assert.equal(data.types.length,30);
assert.equal(data.approval.teacherApprovedCount,90);
assert.equal(data.approval.draftSha256,'7bdc4fa4bf6d006a96135e1798b4421b5cbb25dda4768592c2732d4f9db79375');
const q01Type=data.types.find(x=>x.generatorId==='mid8-q01');
assert.equal(q01Type.label,'자리를 바꾸면 45 차이 나는 네 자리 수');
assert.ok(q01Type.searchAliases.includes('자리를 바꾸면 커지는 네 자리 수'));
assert.ok(q01Type.searchAliases.includes('자리를 바꾸면 작아지는 네 자리 수'));
assert.deepEqual(data.items.filter(x=>x.sourceNo===1).map(x=>[x.detailType,/45 (큰|작은) 수/.exec(x.text)[1]]),[
  ['자리를 바꾸면 45 차이 나는 네 자리 수','큰'],
  ['자리를 바꾸면 45 차이 나는 네 자리 수','작은'],
  ['자리를 바꾸면 45 차이 나는 네 자리 수','큰']
]);
const q02Type=data.types.find(x=>x.generatorId==='mid8-q02');
assert.equal(q02Type.label,'9로 나눈 나머지 조건(두 자리 수)');
assert.ok(q02Type.searchAliases.includes('9로 나눈 나머지가 3인 두 자리 수'));
assert.deepEqual(data.items.filter(x=>x.sourceNo===2).map(x=>[x.detailType,x.text.match(/나머지가 (\d+)/)[1]]),[
  ['9로 나눈 나머지 조건(두 자리 수)','4'],['9로 나눈 나머지 조건(두 자리 수)','5'],['9로 나눈 나머지 조건(두 자리 수)','6']
]);
const q10Type=data.types.find(x=>x.generatorId==='mid8-q10');
assert.equal(q10Type.label,'순서쌍 배열의 규칙');
assert.ok(q10Type.searchAliases.includes('순서쌍 배열의 50번째'));
assert.deepEqual(data.items.filter(x=>x.sourceNo===10).map(x=>[x.detailType,x.text.match(/\d+번째/)[0]]),[
  ['순서쌍 배열의 규칙','42번째'],['순서쌍 배열의 규칙','59번째'],['순서쌍 배열의 규칙','72번째']
]);
adapter.useData(data);
assert.equal(adapter.listTypes().length,30);
const sources=adapter.listSourceItems();assert.equal(sources.length,30);
for(let no=1;no<=30;no++){
  const genId='mid8-q'+String(no).padStart(2,'0');
  const generator=adapter.getGenerator(genId);assert.ok(generator,genId+' approved generator');
  const group=generator.items;
  assert.deepEqual(group.map(x=>x.variantNo),[1,2,3]);
  assert.equal(registry.sourceItemGenerator('middle|8|'+no).sourceAudit.visualRequired,group.some(x=>Boolean(x.asset)));
  for(const x of group){
    assert.equal(x.id,genId+'-v'+x.variantNo);
    assert.equal(x.sourceNo,no);assert.equal(x.reviewStatus,'verified');assert.equal(x.teacherApproved,true);
    assert.equal(x.sourceMeta.approvalId,data.approval.id);
    assert.match(x.sourceMeta.contentHash,/^[a-f0-9]{64}$/);
    assert.equal(x.sourceEquivalentConfirmed,false,'user approval must not assert unproven source equivalence');
    assert.ok(x.text&&x.solution&&x.answer&&x.solutionSteps.length>=2);
    assert.equal(x.pointBand,no<=12?'2.7':no<=22?'3.4':'4.2');
    assert.equal(Boolean(x.solutionAsset),no===13,'13번 색칠 답안은 정답 그림이 필요합니다.');
    for(const asset of [x.asset,x.solutionAsset].filter(Boolean)){
      assert.equal(asset.kind,'raster');assert.match(asset.src,/^data:image\/png;base64,/);
      const bytes=Buffer.from(asset.src.slice('data:image/png;base64,'.length),'base64');
      assert.equal(bytes.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
      assert.equal(crypto.createHash('sha256').update(bytes).digest('hex'),asset.rasterSha256);
      assert.ok(asset.width>=100&&asset.height>=40);
    }
  }
}
sources.forEach(x=>assert.deepEqual(adapter.validateSourceItem(x),[]));
const adapters=require('../bank/core/adapter-registry.js');
const ctx={window:{QUESTION_BANK_ADAPTERS:adapters},URLSearchParams,Set,Map,fetch:()=>{throw Error('Unexpected network');}};
vm.runInNewContext(read('bank/bank-fixed.js'),ctx);
const fixed=ctx.window.BANK_FIXED;
assert.equal(fixed.validate(data,'middle8').items.length,90);
const ids=Array.from({length:30},(_,i)=>'mid8-q'+String(i+1).padStart(2,'0'));
const selected=fixed.select(data,{bankCode:'middle8',genIds:ids,pointBand:'all'});
assert.equal(selected.questions.length,90);assert.equal(selected.bankLabel,'중급 8회');
assert.throws(()=>fixed.validate(data,'middle7'));
const notReviewed=structuredClone(data);notReviewed.items[0].reviewStatus='pending';
assert.throws(()=>fixed.select(notReviewed,{bankCode:'middle8',genIds:['mid8-q01']}));
assert.equal(personal.isAllowed('middle8','학생',{archiveProductAccess:{'mock-mid-8':['학생']}}),true);
assert.equal(personal.isAllowed('middle8','학생',{archiveProductAccess:{'mock-mid-7':['학생']}}),false);
for(const count of [10,20,30]){
  const pool=personal.buildPool([{key:'8',score:{ox:'O'.repeat(30)}}],{middle8:data},'all','all',count);
  assert.equal(pool.available,count);assert.ok(pool.questions.every(x=>x.code==='middle8'));
}
const wrong=personal.buildPool([{key:'8',score:{ox:'X'+'O'.repeat(29)}}],{middle8:data},'wrong','all',30);
assert.equal(wrong.questions.length,3);assert.ok(wrong.questions.every(x=>x.item.sourceNo===1));
assert.ok(!read('bank/data/middle8-reviewed.json').includes('.private-work'));
console.log('PASS: Middle 8 approved 90, assets and hashes, fixed selection, scoped access, personal practice, source registry.');
