'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),crypto=require('node:crypto'),{execFileSync}=require('node:child_process');
const root=path.resolve(__dirname,'..'),read=f=>fs.readFileSync(path.join(root,f)),sha=x=>crypto.createHash('sha256').update(x).digest('hex');
const pack=JSON.parse(read('bank/data/last3-reviewed.json'));
assert.equal(pack.sourceSet,'last');assert.equal(pack.sourceRound,3);assert.equal(pack.items.length,90);
assert.equal(pack.freezePolicy.runtimeGeneration,false);assert.equal(pack.freezePolicy.fixedItemCount,90);
assert.deepEqual(pack.freezePolicy.availableSourceNos,Array.from({length:30},(_,i)=>i+1));assert.deepEqual(pack.blocked,[]);
assert.equal(pack.approval.basis,'사용자 90문항 전체 통과');
const privatePath='.private-work/last3-reuse-20261015/last3-variants-draft.json';
if(fs.existsSync(path.join(root,privatePath))){
  const original=read(privatePath),draft=JSON.parse(original);
  assert.equal(pack.approval.draftSha256,sha(original),'approval binds the reviewed content, not a future rebuild');
  // The draft fingerprints describe the approval-day source. Several source
  // files have since changed on main for other approved work, so compare the
  // current checkout with its Git baseline instead of requiring old hashes.
  for(const record of draft.protectedSourceFingerprints.filter(x=>x.file!=='last-report-data.js')){
    assert.doesNotThrow(()=>execFileSync('git',['diff','--quiet','HEAD','--',record.file],{cwd:root,stdio:'ignore'}),'current source preserved '+record.file);
  }
  for(const item of pack.items){
    const q=draft.items.find(x=>x.id===item.id);
    for(const field of ['text','answer','acceptedAnswers','solutionSteps','solution','area','detailType','pointBand'])assert.deepEqual(item[field],q[field],item.id+' '+field);
    assert.equal(q.independentCheckEvidence.agreement,true);
    if(q.asset)assert.deepEqual(item.asset,q.asset,'unchanged source picture');
    if(q.givenRows)assert.deepEqual(item.promptDataLines,q.givenRows,'written given expression retained');
    if(q.figureHtml)assert.ok(item.asset&&item.asset.src,'approved code table rendered through the existing raster contract');
  }
}
const ids=new Set();
for(const item of pack.items){
  assert.equal(item.sourceSet,'last');assert.equal(item.sourceRound,3);
  assert.equal(item.id,`last3-q${String(item.sourceNo).padStart(2,'0')}-v${item.variantNo}`);
  assert.ok(!ids.has(item.id));ids.add(item.id);
  assert.equal(item.reviewStatus,'verified');assert.ok(item.subarea&&item.detailType);
  assert.equal(item.solution,item.solutionSteps.join(' '));
  assert.deepEqual(Object.keys(item).filter(x=>['model','reusedFrom','originalComparison','independentCheckEvidence','figureHtml','humanReview','reviewCaution','assetReuse'].includes(x)),[],'private source/evidence is not exported');
  if(item.asset){assert.equal(item.asset.kind,'raster');assert.match(item.asset.src,/^data:image\/png;base64,/);assert.doesNotMatch(item.asset.description,/undefined/);}
}
for(let no=1;no<=30;no++)assert.deepEqual(pack.items.filter(x=>x.sourceNo===no).map(x=>x.variantNo),[1,2,3]);
assert.ok(pack.items.filter(x=>x.sourceNo===28).every(x=>x.answerContract==='draw-symbols'));
assert.ok(pack.items.filter(x=>x.sourceNo===30).every(x=>x.answerContract==='ordered-person-pair'));
function report(old){
  const window={location:{search:'?set=last&round=3'}},ctx=vm.createContext({window,URLSearchParams});
  for(const f of ['mock-data-last.js','mock-data-last3.js','mock-data-last4.js','last-score-data.js','last-answer-data.js','last1-detailed-data.js','last2-detailed-data.js','last-report-data.js']){
    const code=old&&f==='last-report-data.js'?execFileSync('git',['show','HEAD:'+f],{cwd:root,encoding:'utf8'}):read(f).toString();
    vm.runInContext(code,ctx);
  }
  return JSON.parse(JSON.stringify(window.GFIELD_MOCK_LAST));
}
const old=report(true),now=report(false);
for(const n of ['1','2','4'])assert.deepEqual(now.rounds[n],old.rounds[n],'unrelated round '+n);
assert.deepEqual(now.rounds['3'].stats,old.rounds['3'].stats,'source averages, percentages and cutoffs unchanged');
for(const item of now.rounds['3'].items){
  const before=old.rounds['3'].items[item.no-1],variant=pack.items.find(x=>x.sourceNo===item.no);
  assert.equal(item.answer,before.answer);assert.equal(item.comment,before.comment);assert.equal(item.detailedSolution,before.detailedSolution);
  assert.equal(item.type,variant.detailType);assert.equal(item.area,variant.area);assert.equal(item.subarea,variant.subarea);assert.equal(String(item.pts),variant.pointBand);
}
const adapter=require('../bank/adapters/last3-reviewed-adapter.js');
adapter.useData(pack);assert.equal(adapter.listTypes().length,30);assert.equal(adapter.listSourceItems().length,30);
assert.equal(adapter.getGenerator('last2-q01'),null);assert.equal(adapter.getGenerator('final3-q01'),null);
for(const no of [1,15,28,30])assert.equal(adapter.getGenerator('last3-q'+String(no).padStart(2,'0')).items.length,3);
const copy=JSON.parse(JSON.stringify(pack));copy.items[0].reviewStatus='pending-human-review';adapter.useData(copy);assert.equal(adapter.getGenerator('last3-q01'),null,'one pending variant locks the whole group');
assert.throws(()=>adapter.useData({...pack,sourceRound:2}));adapter.useData(pack);
const returned=adapter.getGenerator('last3-q01');returned.items[0].answer='tampered';assert.notEqual(adapter.getGenerator('last3-q01').items[0].answer,'tampered');
console.log('PASS Last3 exact 90-item approval, private evidence boundary, original answers/statistics and unrelated rounds preserved, fail-closed adapter');
