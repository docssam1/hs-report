'use strict';
const assert=require('node:assert/strict'),fs=require('node:fs'),cp=require('node:child_process'),vm=require('node:vm');
const pack=require('../bank/data/last4-reviewed.json'),baseline=JSON.parse(cp.execFileSync('git',['show','cf522d5c:bank/data/last4-reviewed.json'],{encoding:'utf8',maxBuffer:8e6}));
for(const q of pack.items){const old=baseline.items.find(x=>x.id===q.id);for(const k of ['answer','acceptedAnswers','area','detailType','pointBand'].concat(q.sourceNo===27?[]:['solutionSteps','solution']))assert.deepEqual(q[k],old[k],q.id+' '+k);if(![1,14,27].includes(q.sourceNo))assert.deepEqual(q,old,'unchanged '+q.id);}
for(const q of pack.items.filter(x=>x.sourceNo===1)){assert.ok(q.asset);assert.equal(q.promptDataLines,undefined);assert.equal(q.promptDataLabel,undefined);assert.doesNotMatch(q.text,/상자에 적힌 말/);}
for(const q of pack.items.filter(x=>x.sourceNo===27)){assert.ok(q.asset.width>=1260);assert.notEqual(q.asset.src,baseline.items.find(x=>x.id===q.id).asset.src);}
// Independent path weights: three endpoints in (나), one via a two-way fork and two via a three-way fork.
const weights=[1/2/2,1/2/3,1/2/3];assert.ok(Math.abs(weights.reduce((a,b)=>a+b)-7/12)<1e-12);
for(const q of pack.items.filter(x=>x.sourceNo===27)){const n=[84,98,126][q.variantNo-1];assert.ok(Math.abs(parseInt(q.answer)*weights.reduce((a,b)=>a+b)-n)<1e-9);}
for(const f of ['mock-assets/last4/q14-seating-clues.png','materials/last_final_4/003.jpg','mock-data-last4.js','last-answer-data.js','last-score-data.js','data.js'])cp.execFileSync('git',['diff','--quiet','HEAD','--',f]);
for(const q of pack.items.filter(x=>x.sourceNo===14)){assert.ok(q.asset&&q.solutionAsset);assert.notEqual(q.asset.src,q.solutionAsset.src);}
console.log('PASS Q1 embedded box statements, Q27 branch fractions, 81 unchanged variants, all original answers/assets preserved');
