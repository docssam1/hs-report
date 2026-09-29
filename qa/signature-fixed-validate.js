'use strict';
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const registry=require('../bank/bank-registry.js');

let total=0,figures=0;
for(const round of [1,2]){
  const data=JSON.parse(fs.readFileSync(path.join(__dirname,'..','bank','data',`original${round}-fixed90.json`),'utf8'));
  assert.equal(data.sourceSet,'original');assert.equal(data.sourceRound,round);assert.equal(data.items.length,90);
  assert.equal(new Set(data.items.map(item=>item.id)).size,90);
  for(let no=1;no<=30;no++){
    const items=data.items.filter(item=>item.sourceNo===no).sort((a,b)=>a.variantNo-b.variantNo);
    assert.deepEqual(items.map(item=>item.variantNo),[1,2,3]);
    const link=registry.sourceItemGenerator(`original|${round}|${no}`);
    assert.equal(link.generatorId,`original${round}-q${String(no).padStart(2,'0')}`);
    assert.equal(link.studentWrongPracticeReady,true);
    for(const item of items){
      assert.equal(item.sourceSet,'original');assert.equal(item.sourceRound,round);
      assert.equal(item.genId,link.generatorId);assert.equal(item.reviewStatus,'verified');
      assert.ok(item.text&&item.answer&&item.solution&&item.detailType&&item.area);
      assert.equal(item.pointBand,no<=12?'2.7':no<=22?'3.4':'4.2');
      for(const privateKey of ['sourceLocator','figureSpec','releaseStatus','blockingReasons','teacherAnswerFigureSpec'])assert.equal(Object.hasOwn(item,privateKey),false);
      if(item.asset){
        assert.equal(item.asset.kind,'raster');assert.match(item.asset.src,/^data:image\/png;base64,/);
        const png=Buffer.from(item.asset.src.slice('data:image/png;base64,'.length),'base64');
        assert.equal(png.subarray(0,8).toString('hex'),'89504e470d0a1a0a');
        assert.ok(png.length>1000);figures++;
      }
      total++;
    }
  }
}
const multi=require('../bank/data/original2-fixed90.json').items.filter(item=>item.sourceNo===18);
assert.equal(multi.length,3);
assert.ok(multi.every(item=>item.answerPolicy==='any-valid-arrangement'&&item.solution.includes('15')));
console.log(`PASS Signature fixed bank: ${total} approved variants, ${figures} raster figures, 60 scoped source links, no private source fields`);
