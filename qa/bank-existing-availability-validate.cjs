'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),personal=require('../bank/personal-mock.js');
const ctx={window:{},Set,Map,URLSearchParams};vm.runInNewContext(fs.readFileSync(path.join(root,'bank/bank-fixed.js'),'utf8'),ctx);
const all={archiveAccess:{'최종 모의고사':['검수학생']},archiveProductAccess:Object.fromEntries(['mock-final-7','mock-final-8','mock-signature-1','mock-signature-2','mock-mid-7','mock-mid-8'].map(k=>[k,['검수학생']]))};
const dataFiles=fs.readdirSync(path.join(root,'bank/data')).filter(f=>/^(?:final\d+-fixed90|original\d+-fixed90|(?:final|last|middle)\d+-reviewed)\.json$/.test(f));
const codes=[];
(async()=>{
for(const file of dataFiles){
  let data=JSON.parse(fs.readFileSync(path.join(root,'bank/data',file)));const code=data.sourceSet+data.sourceRound,key=code==='middle7'?'7':code;
  const adapterFile=path.join(root,'bank/adapters',code+'-reviewed-adapter.js');
  if(fs.existsSync(adapterFile)){
    let adapter;const adapterCtx={window:{QUESTION_BANK_ADAPTERS:{register:x=>{adapter=x;}}},fetch:async()=>({ok:true,json:async()=>JSON.parse(JSON.stringify(data))})};
    vm.runInNewContext(fs.readFileSync(adapterFile,'utf8'),adapterCtx);data=await adapter.load();
    assert.ok(fs.readFileSync(path.join(root,'bank/personal-mock.html'),'utf8').includes('adapters/'+code+'-reviewed-adapter.js'),'actual browser loader: '+code);
  }
  assert.equal(personal.availability({key},'검수학생',all).reason,'ready',file+' must be connected');
  assert.equal(ctx.window.BANK_FIXED.validate(data,code).items.length,90);
  for(const scope of ['all','wrong','correct']){
    const ox=scope==='wrong'?'X'.repeat(30):'O'.repeat(30),pool=personal.buildPool([{key,score:{ox}}],{[code]:data},scope,'all',30);
    assert.equal(pool.available,30,code+' '+scope);assert.ok(pool.questions.every(q=>q.code===code));
  }
  codes.push(code);
}
assert.equal(dataFiles.length,14);assert.ok(codes.includes('middle7')&&codes.includes('middle8')&&codes.includes('last3')&&codes.includes('last4'));
const preparing=['hw1','6','4','3','2','1'].map(key=>personal.availability({key},'검수학생',all));
assert.ok(preparing.every(s=>s.reason==='preparing'));
assert.deepEqual(preparing.map(x=>x.label),['활용 모의고사 1회','중급 모의고사 6회','중급 모의고사 4회','중급 모의고사 3회','중급 모의고사 2회','중급 모의고사 1회']);
assert.equal(personal.availability({key:'7'},'다른학생',all).reason,'denied');
assert.equal(personal.availability({key:'original1'},'다른학생',all).reason,'denied');
const note=personal.availabilityNote({preparing:preparing.map(s=>s.label),denied:[],failed:[]});
assert.match(note,/유사문제 준비 중/);assert.doesNotMatch(note,/권한|hw1|미등록\//);
assert.match(personal.availabilityNote({preparing:[],denied:['중급 모의고사 7회'],failed:['파이널 1회']}),/열람 권한 없음.*자료 불러오기 실패/);
const middle=fs.readFileSync(path.join(root,'bank/data/middle7-reviewed.json'));
assert.equal(crypto.createHash('sha256').update(middle).digest('hex'),'08b4c2d390c3384e5b1f396d2f18e0b840117c223df4ed9887e0c90e340bd148','exact old approved export');
console.log('PASS all '+codes.length+' approved banks / '+codes.length*90+' stored variants connected; exact Middle7 approval reused; preparing/denied/load-error distinct; correct/wrong scopes preserved');
})().catch(e=>{console.error(e);process.exitCode=1;});
