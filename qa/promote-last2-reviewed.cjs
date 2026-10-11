'use strict';
// Export the user's approved review payload; never recalculate original keys.
const fs=require('node:fs'),path=require('node:path'),assert=require('node:assert/strict');
const root=path.resolve(__dirname,'..');
const source=path.join(root,'.private-work/last2-variants-20261011/last2-reviewed.json');
const candidate=JSON.parse(fs.readFileSync(source,'utf8'));
assert.equal(candidate.sourceSet,'last');assert.equal(candidate.sourceRound,2);assert.equal(candidate.items.length,90);
const fields=['id','sourceSet','sourceRound','sourceNo','variantNo','genId','pointBand','area','subarea','detailType','text','answer','acceptedAnswers','answerContract','solutionSteps','solution','asset','solutionAsset'];
const items=candidate.items.map(item=>{
  const out={};for(const key of fields)if(item[key]!=null)out[key]=item[key];
  out.reviewStatus='verified';return out;
});
const approved={version:'1.0.0',sourceSet:'last',sourceRound:2,
  freezePolicy:{runtimeGeneration:false,fixedItemCount:90,variantsPerSourceQuestion:3,availableSourceNos:Array.from({length:30},(_,i)=>i+1)},
  approval:{date:'2026-10-11',basis:'사용자 전체 유사문제 확정',originalQ6Answer:'108개',scope:'90개 유사문제 공개 연결; 원문 정답과 상세 풀이 불변'},items,blocked:[]};
fs.writeFileSync(path.join(root,'bank/data/last2-reviewed.json'),JSON.stringify(approved,null,2)+'\n');
console.log('Exported 90 approved Last2 variants; original files unchanged; private evidence not exported.');
