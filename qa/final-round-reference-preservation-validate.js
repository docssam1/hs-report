'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const {execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),core=require('../supabase/functions/hs-final-population/population-core.js');
function model(source){const box={window:{}};vm.createContext(box);vm.runInContext(source,box);return JSON.parse(JSON.stringify(box.window.GFIELD_MOCK_FINAL));}
const base=process.env.GFIELD_REFERENCE_BASE||'915958bd51925b63f738bed386df9170024e36cd';
const before=model(execFileSync('git',['show',base+':mock-data-final.js'],{cwd:root,encoding:'utf8'}));
const after=model(fs.readFileSync(path.join(root,'mock-data-final.js'),'utf8'));
for(const n of [2,3,4]){
 const pub=after.rounds[n].stats;
 assert.deepEqual(Object.keys(pub).sort(),['cuts','mean','protectedReference','rate','rateEvidence']);
 assert.deepEqual(pub.cuts,before.rounds[n].stats.cuts,'approved cutoff scores unchanged');
 assert.equal(pub.protectedReference,'final'+n+'-source-v1');
 assert.equal(pub.rateEvidence.status,'verified-source-aggregate');
 assert.equal(pub.rateEvidence.scope,'provided-original-records');
 assert.match(pub.rateEvidence.version,new RegExp('^final'+n+'-[a-f0-9]{64}$'));
 const privateFile=path.join(root,'supabase/functions/hs-final-population/baseline-final'+n+'.private.json');
 if(process.env.GFIELD_PRIVATE_POPULATION_AUDIT==='1'){
  const baseline=JSON.parse(fs.readFileSync(privateFile,'utf8'));
  assert.equal(baseline.approved,true);
  const response=core.createResponse(baseline,[0,100]);
  assert.equal(response.version,pub.rateEvidence.version);
  assert.equal(response.mean,pub.mean);
  for(let q=1;q<=30;q++)assert.equal(pub.rate[q],Math.round(response.rate[q]*1000)/1000,'source-bound fixed item rate');
  assert.equal(execFileSync('git',['check-ignore',privateFile],{cwd:root,encoding:'utf8'}).trim().length>0,true);
 }
 after.rounds[n].stats=before.rounds[n].stats;
}
const final4Corrections={
  3:['comment','caution'],4:['comment','caution'],9:['answer','comment','caution'],10:['comment','caution'],
  11:['answer','comment','caution'],17:['answer','comment','caution'],21:['answer','comment','caution'],
  24:['answer','comment','caution'],26:['answer','comment'],27:['answer','comment','caution']
};
const expectedFinal4Answers={9:'260알',11:'57',17:'450m',21:'12장',24:'14일',26:'241×83=20003',27:'4250'};
for(const [noText,fields] of Object.entries(final4Corrections)){
 const no=Number(noText),beforeItem=before.rounds['4'].items.find(item=>item.no===no),afterItem=after.rounds['4'].items.find(item=>item.no===no);
 assert.ok(beforeItem&&afterItem,'Final4 reviewed correction item '+no);
 if(Object.prototype.hasOwnProperty.call(expectedFinal4Answers,no))assert.equal(afterItem.answer,expectedFinal4Answers[no],'Final4 corrected answer '+no);
 for(const field of fields){assert.equal(typeof afterItem[field],'string');assert.ok(afterItem[field].trim());beforeItem[field]=afterItem[field];}
}
assert.deepEqual(after,before,'only Final2-4 reference aggregates and the exact reviewed Final4 correction fields changed');
console.log('PASS source-bound references, fixed rates/cuts, exact Final4 reviewed correction allowlist, all other questions/answers preserved');
