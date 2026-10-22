'use strict';
// Fixed authored variants, source isolation, fail-closed adapter and curriculum links.
const assert=require('node:assert/strict'),fs=require('node:fs'),vm=require('node:vm'),cp=require('node:child_process');
const pack=require('../bank/data/last4-reviewed.json'),adapter=require('../bank/adapters/last4-reviewed-adapter.js'),registry=require('../bank/bank-registry.js');
assert.equal(pack.sourceSet,'last');assert.equal(pack.sourceRound,4);assert.equal(pack.items.length,90);
assert.equal(pack.freezePolicy.fixedItemCount,90);assert.equal(pack.freezePolicy.runtimeGeneration,false);
assert.deepEqual(pack.freezePolicy.availableSourceNos,Array.from({length:30},(_,i)=>i+1));
assert.equal(new Set(pack.items.map(x=>x.id)).size,90);
for(const q of pack.items){
 assert.equal(q.id,`last4-q${String(q.sourceNo).padStart(2,'0')}-v${q.variantNo}`);assert.equal(q.reviewStatus,'verified');
 assert.ok(q.text&&q.answer&&q.solutionSteps.length>=2&&q.area&&q.subarea&&q.detailType);assert.equal(q.solution,q.solutionSteps.join(' '));
 assert.equal(q.sourceSet,'last');assert.equal(q.sourceRound,4);assert.equal(q.pointBand,String(q.sourceNo<=12?2.7:q.sourceNo<=22?3.4:4.2));
 assert.doesNotMatch(q.text,/①|②|③|힌트|풀이 순서/);
 if(q.asset){assert.equal(q.asset.kind,'raster');const png=Buffer.from(q.asset.src.split(',')[1],'base64');assert.equal(png.subarray(1,4).toString(),'PNG');assert.equal(png.readUInt32BE(16),q.asset.width);assert.equal(png.readUInt32BE(20),q.asset.height);}
}
adapter.useData(pack);assert.equal(adapter.listTypes().length,30);assert.equal(adapter.listSourceItems().length,30);
for(let n=1;n<=30;n++){
 const gen='last4-q'+String(n).padStart(2,'0');assert.deepEqual(adapter.getGenerator(gen).items.map(x=>x.variantNo),[1,2,3]);
 const link=registry.sourceItemGenerator('last|4|'+n);assert.equal(link.generatorId,gen);assert.equal(link.studentWrongPracticeReady,true);
}
assert.equal(adapter.getGenerator('final4-q01'),null);assert.equal(adapter.getGenerator('last3-q01'),null);
const pending=structuredClone(pack);pending.items[0].reviewStatus='pending';adapter.useData(pending);assert.equal(adapter.getGenerator('last4-q01'),null);adapter.useData(pack);
function report(old){const w={location:{search:'?set=last&round=4'}},c=vm.createContext({window:w,URLSearchParams});for(const f of ['mock-data-last.js','mock-data-last3.js','mock-data-last4.js','last-score-data.js','last-answer-data.js','last1-detailed-data.js','last2-detailed-data.js','last-report-data.js','mock-rx-data.js']){vm.runInContext(old?cp.execFileSync('git',['show','HEAD:'+f],{encoding:'utf8'}):fs.readFileSync(f,'utf8'),c);}return w;}
const before=report(true),now=report(false),plain=x=>JSON.parse(JSON.stringify(x));
for(const n of [1,2,3])assert.deepEqual(plain(now.GFIELD_MOCK_LAST.rounds[n]),plain(before.GFIELD_MOCK_LAST.rounds[n]));
const r=now.GFIELD_MOCK_LAST.rounds[4],old=before.GFIELD_MOCK_LAST.rounds[4];assert.deepEqual(plain(r.stats),plain(old.stats));
for(const q of r.items){const prev=old.items[q.no-1];for(const k of ['answer','comment','pts','detailedSolution','area','type','t'])assert.equal(q[k],prev[k],'original '+q.no+' '+k);const rx=now.GFIELD_CURRICULUM.resolve('last',4,q);assert.ok(rx&&Object.values(rx.books).some(a=>a.length),'book connection '+q.no);assert.deepEqual(plain(rx.pts),plain(q.studyPoints));}
for(const f of ['data.js','last-answer-data.js','last-score-data.js','mock-data-last4.js','docssam-columns.js','bank/data/last3-reviewed.json','bank/data/final4-fixed90.json'])assert.doesNotThrow(()=>cp.execFileSync('git',['diff','--quiet','HEAD','--',f]));
cp.execFileSync(process.env.GFIELD_QA_PYTHON||'python3',['qa/last4-math-validate.py'],{stdio:'inherit'});
console.log('PASS Last4 90 fixed records, 30 curriculum links, fail-closed release and original data preservation');
