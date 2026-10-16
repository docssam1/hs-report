'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const dir=path.resolve(__dirname,'..'),read=p=>fs.readFileSync(path.join(dir,p),'utf8');
const data=JSON.parse(read('bank/data/middle7-reviewed.json'));
const adapter=require('../bank/adapters/middle7-reviewed-adapter.js');
const registry=require('../bank/bank-registry.js');
adapter.useData(data);
assert.equal(data.sourceSet,'middle');assert.equal(data.sourceRound,7);assert.equal(data.items.length,90);
assert.equal(adapter.listTypes().length,30);assert.equal(adapter.listSourceItems().length,30);
for(let no=1;no<=30;no++){
  const genId='mid7-q'+String(no).padStart(2,'0'),group=adapter.getGenerator(genId).items;
  assert.equal(group.length,3);assert.deepEqual(group.map(x=>x.variantNo),[1,2,3]);
  assert.equal(registry.sourceItemGenerator('middle|7|'+no).sourceAudit.visualRequired,group.some(x=>Boolean(x.asset)), 'Visual inventory must match approved question figures.');
  for(const x of group){
    assert.equal(x.id,genId+'-v'+x.variantNo);assert.equal(x.sourceNo,no);
    assert.equal(x.reviewStatus,'verified');assert.equal(x.teacherApproved,true);
    assert.match(x.sourceMeta.contentHash,/^[a-f0-9]{64}$/);
    assert.equal(x.sourceMeta.approvalId,data.approval.id);
    assert.equal(x.pointBand,no<=12?'2.7':no<=22?'3.4':'4.2');
    for(const key of ['asset','solutionAsset'])if(x[key]){assert.equal(x[key].kind,'raster');assert.match(x[key].src,/^data:image\/png;base64,/);}
  }
}
adapter.listSourceItems().forEach(x=>assert.deepEqual(adapter.validateSourceItem(x),[]));
const adapters=require('../bank/core/adapter-registry.js');
const ctx={window:{QUESTION_BANK_ADAPTERS:adapters},URLSearchParams,Set,Map,fetch:()=>{throw Error('Unexpected network');}};
vm.runInNewContext(read('bank/bank-fixed.js'),ctx);
const fixed=ctx.window.BANK_FIXED;
assert.equal(fixed.validate(data,'middle7').items.length,90);
const ids=Array.from({length:30},(_,i)=>'mid7-q'+String(i+1).padStart(2,'0'));
const selected=fixed.select(data,{bankCode:'middle7',genIds:ids,pointBand:'all'});
assert.equal(selected.questions.length,90);assert.equal(selected.bankLabel,'중급 7회');
assert.throws(()=>fixed.validate(data,'final7'));
assert.throws(()=>fixed.select(data,{bankCode:'middle7',genIds:['final7-q01']}));
const unapproved=structuredClone(data);unapproved.items[0].reviewStatus='pending';
assert.throws(()=>fixed.select(unapproved,{bankCode:'middle7',genIds:['mid7-q01']}));
const personal=require('../bank/personal-mock.js');
assert.equal(personal.isAllowed('middle7','학생',{archiveProductAccess:{'mock-mid-7':['학생']}}),true);
assert.equal(personal.isAllowed('middle7','학생',{archiveProductAccess:{'mock-final-7':['학생']}}),false);
for(const count of [10,20,30]){
  const p=personal.buildPool([{key:'7',score:{ox:'O'.repeat(30)}}],{middle7:data},'all','all',count);
  assert.equal(p.available,count);assert.ok(p.questions.every(x=>x.code==='middle7'));
}
const wrong=personal.buildPool([{key:'7',score:{ox:'X'+'O'.repeat(29)}}],{middle7:data},'wrong','all',30);
assert.equal(wrong.questions.length,3);assert.ok(wrong.questions.every(x=>x.item.sourceNo===1));
assert.equal(personal.buildPool([{key:'8',score:{ox:'O'.repeat(30)}}],{middle7:data},'all','all',30).available,0);
assert.ok(!read('bank/data/middle7-reviewed.json').includes('.private-work'));
console.log('PASS: Middle 7 approved 90 / existing adapter / fixed selection / score-key 7 / scoped permission / 10-20-30 / no other-round substitution.');
