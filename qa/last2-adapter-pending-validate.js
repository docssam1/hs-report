'use strict';
const assert=require('node:assert/strict');
const registry=require('../bank/core/adapter-registry.js');
const adapter=require('../bank/adapters/last2-reviewed-adapter.js');
const fs=require('node:fs'),path=require('node:path');
function fixture(status='pending-human-review',available=[]){return {
  sourceSet:'last',sourceRound:2,freezePolicy:{availableSourceNos:available},
  items:[1,2,3].map(variantNo=>({sourceSet:'last',sourceRound:2,sourceNo:1,variantNo,id:'last2-q01-v'+variantNo,genId:'last2-q01',reviewStatus:status,area:'수·규칙찾기',subarea:'수와 숫자',detailType:'합성 검수 유형',pointBand:'2.7',text:'합성',answer:'1'}))
};}
assert.equal(registry.get('gfield-last2-reviewed'),adapter);
assert.deepEqual(registry.validateAdapter(adapter),[]);
for(const data of [fixture(),fixture('verified'),fixture('pending-human-review',[1])]){
  adapter.useData(data);
  assert.deepEqual(adapter.listTypes(),[]);
  assert.deepEqual(adapter.listSourceItems(),[]);
  assert.equal(adapter.getGenerator('last2-q01'),null);
}
const partial=fixture('verified',[1]);partial.items[1].reviewStatus='pending-human-review';
adapter.useData(partial);assert.equal(adapter.getGenerator('last2-q01'),null);
for(const mutate of [d=>d.items[0].sourceRound=1,d=>d.items[0].genId='last1-q01',d=>d.items[0].variantNo=2,d=>d.items[0].detailType='다른 유형',d=>d.items.pop()]){
  const d=fixture('verified',[1]);mutate(d);adapter.useData(d);
  assert.deepEqual(adapter.listTypes(),[]);assert.equal(adapter.getGenerator('last2-q01'),null);
}
assert.throws(()=>adapter.useData({...fixture(),sourceRound:1}),/출처/);
const pending=fixture();adapter.useData(pending);
pending.freezePolicy.availableSourceNos.push(1);pending.items.forEach(x=>x.reviewStatus='verified');
assert.equal(adapter.getGenerator('last2-q01'),null,'caller mutation cannot silently approve');
adapter.useData(fixture('verified',[1]));
assert.equal(adapter.listTypes()[0].label,'합성 검수 유형');
assert.deepEqual(adapter.listSourceItems()[0].sourceLocator,{set:'last',round:2,questionNo:1});
assert.deepEqual(adapter.validateSourceItem(adapter.listSourceItems()[0]),[]);
assert.equal(adapter.getGenerator('last2-q01').items.length,3);
assert.equal(adapter.getGenerator('last1-q01'),null);
assert.equal(adapter.getGenerator('last2-q31'),null);
const returned=adapter.getGenerator('last2-q01');returned.items[0].sourceRound=1;
assert.equal(adapter.getGenerator('last2-q01').items[0].sourceRound,2,'returned data isolated');
const candidate=path.resolve(__dirname,'../bank/data/last2-reviewed.json');
if(fs.existsSync(candidate)){
  const real=JSON.parse(fs.readFileSync(candidate,'utf8'));
  assert.equal(real.items.length,90);assert.deepEqual(real.freezePolicy.availableSourceNos,Array.from({length:30},(_,i)=>i+1));
  adapter.useData(real);assert.equal(adapter.listTypes().length,30);assert.equal(adapter.listSourceItems().length,30);
  for(let no=1;no<=30;no++)assert.equal(adapter.getGenerator('last2-q'+String(no).padStart(2,'0')).items.length,3);
}
console.log('PASS Last2 approved 30 groups; pending/partial/source/duplicate locks preserved');
