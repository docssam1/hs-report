'use strict';
// Validate the approved public export against preserved private review evidence.
const assert=require('node:assert/strict'),fs=require('node:fs'),path=require('node:path'),vm=require('node:vm');
const root=path.resolve(__dirname,'..'),file=path.join(root,'bank/data/last2-reviewed.json');
const data=JSON.parse(fs.readFileSync(file,'utf8'));
const privateFile=path.join(root,'.private-work/last2-variants-20261011/last2-reviewed.json');
const evidence=fs.existsSync(privateFile)?JSON.parse(fs.readFileSync(privateFile,'utf8')):null;
const window={location:{search:'?set=last&round=2'}};window.window=window;
const ctx=vm.createContext({window,URLSearchParams});
for(const f of ['mock-data-last.js','mock-data-last3.js','mock-data-last4.js','last-score-data.js','last-answer-data.js','last1-detailed-data.js','last2-detailed-data.js','last-report-data.js'])vm.runInContext(fs.readFileSync(path.join(root,f),'utf8'),ctx);
assert.equal(data.sourceSet,'last');assert.equal(data.sourceRound,2);assert.equal(data.items.length,90);
assert.equal(data.freezePolicy.fixedItemCount,90);assert.equal(data.freezePolicy.runtimeGeneration,false);
assert.deepEqual(data.freezePolicy.availableSourceNos,Array.from({length:30},(_,i)=>i+1));assert.deepEqual(data.blocked,[]);
assert.equal(data.approval.originalQ6Answer,'108개');
const originals=window.GFIELD_MOCK_LAST.rounds['2'].items;
assert.equal(new Set(data.items.map(i=>i.id)).size,90);
assert.equal(new Set(data.items.map(i=>i.text+'|'+(i.asset?.src||''))).size,90,'distinct actual prompt or figure');
for(let no=1;no<=30;no++){
  const rows=data.items.filter(i=>i.sourceNo===no);assert.equal(rows.length,3);
  assert.deepEqual(rows.map(i=>i.variantNo),[1,2,3]);
  for(const item of rows){
    const original=originals[no-1];
    assert.equal(item.id,'last2-q'+String(no).padStart(2,'0')+'-v'+item.variantNo);
    assert.equal(item.genId,'last2-q'+String(no).padStart(2,'0'));
    assert.equal(item.sourceSet,'last');assert.equal(item.sourceRound,2);
    assert.equal(item.area,original.area);assert.equal(item.subarea,original.subarea);assert.equal(item.detailType,original.type);
    assert.equal(item.pointBand,String(original.pts));assert.equal(item.reviewStatus,'verified');
    assert.ok(item.text&&item.answer&&item.acceptedAnswers?.length&&item.solutionSteps.length>=2);
    assert.equal(item.solution,item.solutionSteps.join(' '));
    assert.equal(item.independentCheckEvidence,undefined,'private verification stays private');
    assert.equal(item.sourceComparison,undefined,'private source comparisons stay private');
    if(evidence){
      const reviewed=evidence.items.find(x=>x.id===item.id);
      for(const key of Object.keys(item).filter(x=>x!=='reviewStatus'))assert.deepEqual(item[key],reviewed[key],'approved content unchanged: '+item.id+' '+key);
      assert.equal(reviewed.independentCheckEvidence.agreement,true);
      assert.ok(reviewed.independentCheckEvidence.method1&&reviewed.independentCheckEvidence.method2);
      const axes=reviewed.difficultyComparisons||reviewed.sourceComparison.difficultyAxes;
      assert.equal(Object.keys(axes).length,9,'preserved nine-axis evidence');
    }
    for(const k of ['asset','solutionAsset'])if(item[k]){
      assert.equal(item[k].kind,'raster');assert.match(item[k].src,/^data:image\/png;base64,/);
      const bytes=Buffer.from(item[k].src.split(',')[1],'base64');
      assert.equal(bytes.subarray(1,4).toString(),'PNG');assert.ok(bytes.readUInt32BE(16)>0&&bytes.readUInt32BE(20)>0);
    }
  }
}
for(const item of data.items.filter(i=>i.sourceNo===30)){
  assert.equal(item.answerContract,'strict-upper-time-bound');
  assert.ok(item.acceptedAnswers.every(a=>!/^\s*[\d.]+\s*(?:초)?\s*$/.test(a)),'a bare boundary time is not the strict condition answer');
}
const approved=fs.readFileSync(path.join(root,'last2-detailed-data.js'),'utf8');
assert.match(approved,/11,064/);assert.match(approved,/102/);
assert.match(approved,/solution\(6,[^\n]*'108개'/);
console.log('PASS Last2 90 user-approved variants, exact taxonomy/points/assets, private-evidence boundary, strict Q30, original Q6=108 unchanged');
